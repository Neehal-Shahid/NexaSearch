# ARCHITECTURE.md — Nexa Search

How the pieces fit together and how data actually flows through the app.

## High-level shape

```
Browser (React SPA)
   │
   ├─ /api/search  ──► Vercel serverless ──► SerpAPI            (Google web/images/news/videos/shopping)
   ├─ /api/chat    ──► Vercel serverless ──► Gemini generateContent  (AI overview, chat, translation, currency)
   └─ /api/admin   ──► Vercel serverless ──► SerpAPI account endpoint + Gemini models endpoint

Persistence: 100% client-side localStorage. No database, no server sessions, no auth of any kind.
```

There is no backend application server beyond three stateless Vercel functions in `/api`. Every function reads its API keys from server-side env vars (`SERPAPI_KEY`, `SERPAPI_KEY_2`, `GEMINI_API_KEY`) and the browser never sees them.

## Routing

`src/App.jsx` sets up `BrowserRouter` with a flat route table. `HomePage` is eagerly imported; every other page is `lazy()`-loaded and wrapped in a single `<Suspense fallback={<PageLoader/>}>` around the `<Routes>` block — one shared loading spinner for all lazy routes, not per-route.

```
/            HomePage
/search      SearchPage   (?q=&type=&page= — all state lives in the URL query string)
/saved       SavedPage
/history     HistoryPage
/about       AboutPage
/privacy     PrivacyPage
/terms       TermsPage
/admin       AdminPage    (no route guard — see below)
```

Two providers wrap the whole tree in `App.jsx`: `SearchHistoryProvider` → `SavedResultsProvider`. `CommandPalette` (Cmd/Ctrl+K) and `Header`/`Footer` render on every page outside the `<Suspense>` boundary.

## The search request lifecycle (SearchPage.jsx — the core page)

1. URL query params (`q`, `type`, `page`) are the single source of truth — read via `useSearchParams`. There is no separate React state duplicating them.
2. Before anything hits the network, `isAdultQuery(query)` (from `utils/moderation.js`) runs client-side. If it flags the query, `useSearch` is called with an **empty string** instead of the real query — the real API call is simply never made — and the page renders a moderation screen (random Quran quote) instead of results.
3. `useSearch(query, type, page)` owns the actual fetch: it builds an `AbortController` per param-change, cancels the previous in-flight request, and returns `{ data, loading, error, retry }`.
4. `useSearch` delegates to `src/api/searchClient.js`, which:
   - Checks an in-memory `Map` cache (key = `query|type|page`, capped at 50 entries, evicted FIFO) before hitting the network.
   - Reads `localStorage.nexa_primary_key` — if set to `'2'`, appends `keyPref=2` to the request so the server prefers the backup SerpAPI key.
   - Calls `/api/search?...`.
5. `/api/search` (Vercel function, or the equivalent Vite dev middleware) resolves `type` → SerpAPI `engine` (web→google, images→google_images, etc.), attaches geolocation from Vercel's `x-vercel-ip-city`/`x-vercel-ip-country` headers, and tries `SERPAPI_KEY` then `SERPAPI_KEY_2` in order (or reversed if `keyPref=2`), advancing to the next key only on 429/402 (quota) responses. Successful responses get `Cache-Control: s-maxage=300, stale-while-revalidate=600`.
6. Back in `SearchPage`, `getResults()` picks the right array out of the raw SerpAPI JSON depending on `type` (e.g. `organic_results`, `images_results`, flattened `news_results[].stories`, etc.).
7. `getPackOrder()` runs a small keyword-scoring heuristic against the query to decide the *display order* of inline packs (Top Stories / Images / Videos) mixed into the web results — pure client-side re-ordering, not a real relevance signal from SerpAPI.
8. On successful, non-adult results, the query is recorded into `SearchHistoryContext` (localStorage).

### AI Mode / AI Overview — two distinct, parallel systems

- **`NexaOverview.jsx`** — an inline card shown *above* normal web results when `data.ai_overview` is present. It has its **own separate, inline-only markdown formatter** (bold/italic/inline-code, HTML-escaped first). It renders `text_blocks`, `list`, `code`, `link`, and a media strip from `videos`/`images` fields, all individually guarded. Its chat input hands off to full AI Mode by navigating to `/search?...&type=ai` with `state.chatHistory` pre-seeded.
- **`AiMode.jsx`** — the full chat experience when `type=ai`. On mount, if there's no seeded history (or it ends on a user turn), it auto-fires the first request. It calls `/api/chat`, trying `gemini-3.5-flash-lite` then falling back to `gemini-3.1-flash-lite` on failure. Model replies are rendered through **`utils/markdown.js`'s `parseMarkdown()`** (a different, more complete regex-based parser than `NexaOverview`'s inline one — headings, lists, blockquotes, hr, code blocks with a copy button). A delegated click handler on the chat container catches clicks on `.copy-code-btn` (injected HTML) to copy code snippets.

Both `CurrencyConverterBox.jsx` and `TranslationBox.jsx` also independently call `/api/chat` with the same two-model fallback pattern — this logic exists in three separate places (`AiMode`, `CurrencyConverterBox`, `TranslationBox`), not a shared hook.

## API hardening (added 2026-08-25)

All three `/api/*` functions got a defense-in-depth pass, staying within the "no backend, no database, Vercel-only" constraint:

- **`api/_lib/rateLimit.js`** — a shared, in-memory, per-IP sliding-window limiter (`isRateLimited(key, limit)`), applied to `/api/search` (30/min), `/api/chat` (20/min), `/api/admin` (10/min). It's best-effort: state lives in a module-level `Map` inside one warm serverless instance, so it doesn't hold under multi-instance scale-out and resets on cold start. See DECISIONS.md for why this is the right trade-off given the project's constraints.
- **`api/search.js`** now also validates query length (≤200 chars) and re-runs `isAdultQuery()` (imported from `src/utils/moderation.js`) server-side — closes the gap where calling `/api/search` directly bypassed `SearchPage.jsx`'s client-side-only check.
- **`api/chat.js`** now caps request payload size (≤20,000 chars) — this endpoint is otherwise an open proxy to Gemini, so an unbounded payload from a direct call could run up real cost.
- **`api/admin.js`** now requires an `x-admin-key` header matching the `ADMIN_SECRET` env var; returns 503 if that env var isn't configured (fails closed, not open), 401 if the key doesn't match. `AdminPage.jsx` gates the dashboard behind a key-entry screen, storing the key in `sessionStorage`. `vite.config.js`'s dev middleware mirrors both the moderation check and the admin-secret check for local/production parity.

## Feature flags — client-side, per-browser, centralized as constants

Three plain `localStorage` keys act as feature toggles (`FEATURE_FLAGS` in `src/constants/index.js`), set from `AdminPage.jsx`'s "Local Platform Controls" section and read inline (not via context) wherever needed:

| key | set from | read from | effect |
|---|---|---|---|
| `admin_disable_ai` | AdminPage | `SearchPage.jsx`, `SearchTabs.jsx` | Hides the AI tab and disables AI Overview/AI Mode rendering |
| `admin_disable_media_packs` | AdminPage | `SearchPage.jsx` | Suppresses inline Top Stories/Images/Videos packs in web results |
| `nexa_primary_key` | AdminPage | `src/api/searchClient.js` | Forces SerpAPI to try the backup key (`SERPAPI_KEY_2`) first |

These are **per-browser** (each visitor has their own copy), not global server config, despite the "platform controls" naming. See DECISIONS.md.

## Defensive rendering pattern (why it exists)

SerpAPI's JSON shapes are inconsistent across fields and engines (e.g. `thumbnail` can be a string or `{static: ...}`; `source` can be a string or `{name: ...}`; a `description` can be a string or `{text: ...}`). Recent commit history (`872ab2f "Fix critical white screen crash in NexaOverview..."`) shows this caused real production crashes. The established convention across `src/components/results/` is:

- Every list/grid component: `if (!x || x.length === 0) return null` before rendering.
- Every `<img>`: an `onError` handler that hides the broken element (never a broken-image icon).
- Field access: optional chaining + `||` fallback chains, or explicit `typeof`/`Array.isArray` branches, rather than trusting a single shape.
- Widget dispatchers (`AnswerBox.jsx`) gate on data shape *before* handing off to specialized components, so e.g. `CurrencyConverterBox`/`TranslationBox` can (mostly) assume their expected sub-fields exist.

**Formerly a known exception, now fixed (2026-08-25)**: `ImagePreviewModal.jsx` used to call `new URL(result.link).hostname` with no try/catch. It now uses `extractDomain()` from `utils/formatters.js`, matching the rest of the codebase's defensive convention. Similarly, `NexaOverview.jsx`'s block-rendering `.map()` used to assume every `text_blocks` entry was a non-null object — this only broke when the "Read full overview" toggle revealed blocks past index 1, since those are never rendered (and never crash-tested) until expanded. It now guards with `if (!block || typeof block !== 'object') return null` before touching any field.

### App-wide safety net: ErrorBoundary

Prior to 2026-08-25, this app had **zero React Error Boundaries** — any single uncaught render error (a malformed-data crash like the two above, or any future one) unmounted the *entire* React tree to a blank white page, with no recovery short of a manual browser refresh. `src/components/ui/ErrorBoundary.jsx` is a class-based boundary now wired into `src/App.jsx`, wrapping the routed page content (`AppRoutes`, which renders `<Suspense><Routes>...</Routes></Suspense>`) — not the `Header`/`Footer`/`CommandPalette`, which stay outside the boundary and remain interactive even if the current page crashes. It's keyed to `location.pathname + location.search`, so navigating to any other page automatically clears the error state — no manual reload required. Treat this as a safety net, not a substitute for fixing the underlying defensive-rendering gaps at the source.

## Persistence layer

Everything is `localStorage`, wrapped in `src/utils/localStorage.js`'s try/catch-safe `getStoredData`/`setStoredData`:

- `nexa_saved_results` — bookmarks (`SavedResultsContext`)
- `nexa_search_history` — search history, capped at 50 entries (`SearchHistoryContext`)
- `admin_disable_ai`, `admin_disable_media_packs`, `nexa_primary_key` — feature flags (see above)

There is no sync across devices/browsers and no server-side record of any user activity beyond the stateless SerpAPI/Gemini proxy calls themselves.

## Dev vs. production parity

In production (Vercel), `/api/search`, `/api/chat`, `/api/admin` are the real serverless functions in `api/`. In local dev, `vite.config.js` defines a custom Vite plugin that:
- Re-implements `/api/search`'s SerpAPI-proxying + key-rotation logic as Vite middleware (a **second, separate implementation** of the same logic — can drift from `api/search.js`).
- Re-implements `/api/admin` similarly, plus injects **hardcoded fake `recentActivity`/`topQueries` mock data** that does not exist in the production `api/admin.js` response.
- Proxies `/api/chat` directly to Gemini's REST API via Vite's built-in `server.proxy`, rewriting the URL to inject the model name and API key — this is a genuine proxy (not a reimplementation), so it stays in sync with production behavior automatically.

## Styling

Tailwind CSS with a custom theme (`tailwind.config.js`): white/near-black neutrals, a single teal accent (`#003747` / hover `#004c63`), no default Tailwind color palette in use. Global animation/utility CSS (shimmer skeletons, image-masonry columns, gradient-x, reduced-motion overrides, custom scrollbars) lives in `src/index.css` outside of Tailwind's utility layer where Tailwind alone couldn't express it (keyframes, `columns`, portal-related resets).
