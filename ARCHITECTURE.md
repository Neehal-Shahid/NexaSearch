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
/admin       AdminPage    (page-level password gate via ADMIN_SECRET, not a router guard — see below;
             not linked from any nav, including the Command Palette — reachable only by typing the URL)
```

Two providers wrap the whole tree in `App.jsx`: `SearchHistoryProvider` → `SavedResultsProvider`. `CommandPalette` (Cmd/Ctrl+K) and `Header`/`Footer` render on every page outside the `<Suspense>` boundary.

**Which tab a new query lands on (fixed 2026-08-25)**: `SearchPage.jsx`'s own `SearchBar` (rendered inline, compact variant) stays mounted while browsing any tab, including AI Mode. Submitting a brand-new query from it reuses the current `type` param via `resolveTypeForNewQuery()` in `SearchBar.jsx` — *except* when the current type is `ai`, which always resets to `web`. Staying on Images/Videos/News/Shopping for a new query is intentional (a "keep browsing this result type" workflow); AI Mode is deliberately excluded because it's a chat thread, not a results view, and `AiMode.jsx` has no way to usefully continue an unrelated new query in the same conversation — see its own query-change handling below. `CommandPalette`'s search submission already always used `type=web` unconditionally and didn't need this fix.

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
7. `getPackOrder()` runs a small keyword-scoring heuristic against the query to decide the *display order* of inline packs (Top Stories / Images / Videos) when more than one is available — pure client-side re-ordering, not a real relevance signal from SerpAPI. **It briefly also gated whether a pack showed at all (2026-08-25, eleventh/twelfth pass), reverted the same day (thirteenth pass)**: that gate suppressed a real, legitimate `inline_images` pack for "nike shoes" (a query with no image-related words, yet genuinely relevant product images from SerpAPI) — verified live. Current policy, per explicit product direction: show whatever SerpAPI actually returns for a query, full stop; don't invent packs that aren't there, and don't hide ones that are, even if they occasionally feel tangential (e.g. a video carousel for "cow"). That "feels random/Google-like" concern is being addressed through the visual redesign of these packs, not through suppressing real data — don't reintroduce visibility gating here without revisiting that decision explicitly.
8. On successful, non-adult results, the query is recorded into `SearchHistoryContext` (localStorage).

**Serverless function timeout**: `vercel.json` sets `functions["api/search.js"].maxDuration = 30` seconds, added 2026-08-25 because SerpAPI's `google_shopping` engine can be genuinely slow (a real "nike shoes" shopping search reported `search_metadata.total_time_taken: 34.29` seconds on SerpAPI's own side) and the function previously ran on Vercel's platform default. **This was NOT the cause of the shopping-tab "Search request failed" bug reported the same day** — that turned out to be a completely different issue (see the `gl` country-code note below); this timeout bump is still worth keeping as a separate defensive measure, but don't assume it fixes a shopping-tab failure on its own. 30s was chosen without verifying the account's actual plan tier (Hobby vs. Pro have different maximums) — check the Vercel dashboard if deploys ever fail on this config.

**`gl` (country code) not supported by every engine (fixed 2026-08-25)**: `api/search.js` sends `gl`, derived from the visitor's real `x-vercel-ip-country` header, to every SerpAPI engine unconditionally. Verified live: `google_shopping` rejects `gl=pk` (Pakistan) with `HTTP 400: "Unsupported \`pk\` country - gl parameter."`, while the same code works fine for `in`/`gb`/`ae`, and `pk` itself works fine for other engines (web/images/news/videos) — Google Shopping via SerpAPI simply supports a narrower set of countries. This was the real cause of "Search request failed" specifically on the Shopping tab for visitors in an unsupported country — a genuine data bug, not the timeout. Fixed with a general retry: on any 400 matching `"unsupported ... gl parameter"`, `api/search.js` retries once without `gl`/`location` before treating it as a hard failure. Not engine-specific in the code — if any other engine ever rejects a different country code the same way, this same retry handles it without needing a maintained list of per-engine country support.

### AI Mode / AI Overview — two distinct, parallel systems

- **`NexaOverview.jsx`** — an inline card shown *above* normal web results when `data.ai_overview` is present. It has its **own separate, inline-only markdown formatter** (bold/italic/inline-code, HTML-escaped first). It renders `text_blocks`, `list`, `code`, `link`, and a media strip from `videos`/`images` fields, all individually guarded. Its chat input hands off to full AI Mode by navigating to `/search?...&type=ai` with `state.chatHistory` pre-seeded.
- **`AiMode.jsx`** — the full chat experience when `type=ai`. On mount, if there's no seeded history (or it ends on a user turn), it auto-fires the first request. It calls `/api/chat`, trying `gemini-3.5-flash-lite` then falling back to `gemini-3.1-flash-lite` on failure. Model replies are rendered through **`utils/markdown.js`'s `parseMarkdown()`** (a different, more complete regex-based parser than `NexaOverview`'s inline one — headings, lists, blockquotes, hr, code blocks with a copy button). A delegated click handler on the chat container catches clicks on `.copy-code-btn` (injected HTML) to copy code snippets. **Query-change handling (fixed 2026-08-25)**: `AiMode` stays mounted across a `?q=` change (same `/search` route, same `type=ai`), so it tracks the previous `query` in a ref and restarts the conversation fresh whenever it actually changes — without this, its auto-response condition (empty history, or history ending on an unanswered user turn) is never true again once a conversation has completed, so a new query would silently do nothing and leave the stale previous chat on screen.

Both `CurrencyConverterBox.jsx` and `TranslationBox.jsx` also independently call `/api/chat` with the same two-model fallback pattern — this logic exists in three separate places (`AiMode`, `CurrencyConverterBox`, `TranslationBox`), not a shared hook.

**`utils/markdown.js` placeholder mechanism (fixed 2026-08-25)**: code blocks and inline code are extracted to placeholder tokens before the bold/italic/link/strikethrough regex passes run, then restored with the real HTML at the very end — this is what protects code content from being mangled by markdown syntax that happens to appear inside it. The placeholder format matters: it must use a character none of the other regex passes touch. It used to be `__CODE_BLOCK_N__`, which broke the moment underscore-italic support (`_text_` → `<em>`) was added, since `/_([^_]+)_/g` matched pieces of the double-underscore placeholder itself and corrupted it before the final restoration step could find it. Placeholders now use `@@NEXACODEBLOCK N@@` / `@@NEXAINLINECODE N@@` — if any future markdown feature is added to this parser, check it against both placeholder formats before shipping it.

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

**`ImageResultCard.jsx` — found via actual visual testing, not code review (2026-08-25)**: `imageUrl = result.original || result.thumbnail` prefers a third-party-hosted URL over Google's own reliable thumbnail proxy, and previously had no fallback — any failure of `original` (dead link, hotlink protection, slow/unreachable host) hid the entire card with `onError`, leaving nothing in its place. This silently rendered a **completely blank Images tab** for some queries — a `npm run build` pass would never catch this, only actually loading the page did (see the Playwright note below). Fixed: `onError` now retries once via `result.thumbnail` before hiding the card. One accepted remaining limitation: a source site occasionally serves its own "this image was hotlinked" warning graphic as a genuine 200 response in place of the real thumbnail — `onError` can't detect this since nothing actually failed, it's upstream data-quality noise, not something worth building content-inspection logic to catch.

**`answerBox` must stay referentially stable across renders (fixed 2026-08-25)**: `answerBox` (the data fed to `AnswerBox.jsx` → `WeatherBox`/`CurrencyConverterBox`/`TranslationBox`/etc.) is computed via `useMemo(() => {...}, [data, type, query])`, not a plain `let` recomputed every render. Both `CurrencyConverterBox` and `TranslationBox` sync their internal interactive state (amounts, selected currencies/languages, translated text) from this prop via `useEffect(() => {...}, [data])` — since that dependency check is reference equality, a fresh object on every render (even an unrelated one, e.g. a sibling effect firing) silently reset the user's in-progress swap/edit back to the original seed. If you add a new answer-box widget with similar prop-synced local state, keep it downstream of this same memoized `answerBox`, not a re-derived value.

**Translation intent detection, not a real SerpAPI feature (updated 2026-08-25)**: verified empirically that SerpAPI does not reliably return a real `answer_box` for translation-intent queries (tested several phrasings — none returned one). `detectTranslationIntent()` in `SearchPage.jsx` recognizes `"translate X to/into/in Y"` and `"X meaning in Y"` against the `TRANSLATION_LANGUAGES` list (`src/constants/index.js`, also used by `TranslationBox.jsx`'s language pickers) and synthesizes an `answer_box`-shaped object with an **empty** `target.text` — that emptiness is the signal `TranslationBox.jsx` watches for to fire a real Gemini translation on mount, rather than showing placeholder text. This replaced an earlier, much narrower hack that only matched literal `"translate"` + `"urdu"` and always displayed the same hardcoded (and usually wrong) translated text.

**`aiOverviewData` reset/populate split (fixed 2026-08-25 across two passes — read both) — the general pattern to follow for any query-derived `useState`**: this used to be one `useEffect(() => {...}, [data, type])` that both set and cleared the AI Overview from a single condition. That's fragile for reasons that generalize beyond this one field: `useSearch`'s `data` doesn't clear when `query`/`type` change, it lags until the new fetch resolves — so a condition checked against a stale `data` can momentarily (or, if nothing ever corrects it, permanently) evaluate against the *previous* query's data. SerpAPI's `ai_overview` can also come back as `{page_token, serpapi_link}` with no `text_blocks` (its deferred/paginated shape — verified live for real queries, not rare); a combined set/clear effect with no explicit fallback for that shape does *nothing*, leaving whatever was there before frozen indefinitely.

The fix, and the subtlety that took a second pass to get right: split into two effects — one resets to `null` eagerly on `[query, type, page]`; a second, separate effect populates it, but **that populate effect must depend on `[data]` alone, not `[data, type]`**. Including `type` was the exact bug in the first attempt: `type` changes immediately on navigation (before the new fetch resolves), so a populate effect watching `type` re-fires while `data` is still the *previous* query's response — and if that stale data happens to satisfy the populate condition (which it will, if the previous query is the same text under a different `type`, e.g. AI Mode → web for the same original search), it re-attaches the stale value in the same render pass as the reset, before the reset was ever visible. `type` is still safe to *read* inside the populate effect's body — just not list as a dependency — because `data` only ever changes as a result of a `[query, type, page]` change having already happened, so by the time the effect actually runs, the `type` in its closure is already current. Any future query-derived local state following this reset-then-populate pattern must get this right: the populate half keys off `data` alone.

**Knowledge panel specifics (verified against live SerpAPI data, 2026-08-25)**: `KnowledgePanel.jsx` renders in **two places** in `SearchPage.jsx` — a `lg:hidden` inline placement near the top of the main column (mobile/tablet) and a `hidden lg:block` sidebar (desktop) — both reading the same `knowledgeGraph` data; there used to be only the desktop one, so the panel was invisible below the `lg` breakpoint entirely. Its "Key facts" table doesn't read a `data.facts` object (that field doesn't actually exist in real SerpAPI responses); it derives facts from the entity's dynamic top-level fields (`born`/`died`/`spouse`/... for a person, different fields for other entity types) via `extractFacts()`, filtering out a known set of meta fields and any `..._link`/`..._links` variant.

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
- Re-implements `/api/search`'s SerpAPI-proxying + key-rotation logic as Vite middleware (a **second, separate implementation** of the same logic — can drift from `api/search.js`). This drift already happened once for real: the dev middleware didn't read the `keyPref` query param at all until 2026-08-25, so the admin dashboard's "Primary SerpAPI Key" setting had zero effect in local dev — verified against real SerpAPI account usage numbers before concluding it was fixed, not just by re-reading the code. If you touch key-selection or pagination logic in `api/search.js`, mirror the change here too, or this will drift again.
- Re-implements `/api/admin` similarly, plus injects **hardcoded fake `recentActivity`/`topQueries` mock data** that does not exist in the production `api/admin.js` response.
- Proxies `/api/chat` directly to Gemini's REST API via Vite's built-in `server.proxy`, rewriting the URL to inject the model name and API key — this is a genuine proxy (not a reimplementation), so it stays in sync with production behavior automatically.
- Re-implements `/api/trending` (added 2026-08-25) the same way as `/api/search` — same drift risk, mirrored deliberately from the start this time to avoid repeating the `keyPref` mistake. One real behavior difference from production, not just an omission: dev has no `x-vercel-ip-country` header, so it always requests `geo=US` regardless of where the developer actually is.

## Trending topics — real data, not hardcoded (added 2026-08-25)

`api/trending.js` proxies SerpAPI's `google_trends_trending_now` engine — verified live against the real API key that this returns genuine real-time trending queries (hundreds of items with search volume/category), not something invented for this app. Results are filtered through the same `isAdultQuery()` moderation check used for regular search, capped at 12 items, and cached for 15 minutes server-side (`Cache-Control: s-maxage=900`) since this is a decorative/supplementary feature not worth spending SerpAPI quota on aggressively.

`src/hooks/useTrendingSearches.js` is the single client-side entry point: a module-level cache (not component state) means every consumer shares one fetch and one result, and any failure falls back silently to the static `TRENDING_SEARCHES` list in `src/constants/index.js` — a broken trending fetch should never surface an error state to the user, it's decoration. Two consumers: `CommandPalette.jsx` (Trending section) and `HomePage.jsx`'s `TrendingSearches.jsx` chip list (which existed fully built but was never actually rendered anywhere before this — dead code until now).

## Styling

Tailwind CSS with a custom theme (`tailwind.config.js`): white/near-black neutrals, a single teal accent (`#003747` / hover `#004c63`), no default Tailwind color palette in use. Global animation/utility CSS (shimmer skeletons, image-masonry columns, gradient-x, reduced-motion overrides, custom scrollbars) lives in `src/index.css` outside of Tailwind's utility layer where Tailwind alone couldn't express it (keyframes, `columns`, portal-related resets).

**Result-pack visual language (redesigned 2026-08-25)**: explicit product direction rejected the original bordered-card-grid treatment for video/image/news packs as too generic/Google-like. Current convention for these: **borderless tiles**, not boxes — `rounded-2xl`, a resting `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`, and a much larger shadow plus a slight `-translate-y-1` lift on hover, instead of a border that changes color. Titles default to `text-text-primary` (calm) and only become `text-accent` on hover — never accent-colored at rest — matching the pattern `ShoppingResultGrid.jsx` already established before this pass. `NewsResultCard.jsx` additionally has a `featured` variant (large hero treatment for the single lead story) distinct from `list` (borderless row, used for every other story) — the News tab is not a uniform grid, it has editorial hierarchy. Follow this language for any future result-pack work rather than reintroducing bordered cards.

**Visual verification via Playwright (added 2026-08-25, ad hoc — not a persisted project tool)**: this project had no visual/screenshot verification capability before this pass. Playwright + headless Chromium were installed into the session's scratchpad directory (`npm install playwright` + `npx playwright install chromium`, *not* added to this project's own `package.json`/`node_modules`) and used to launch the real dev server and screenshot actual rendered pages. This is how the `ImageResultCard.jsx` fallback bug (see the defensive rendering section above) was actually found — a passing `npm run build` alone would never have caught a component silently rendering nothing. If a future session needs to visually verify a UI change here again, the same throwaway-install approach works; consider running `/run-skill-generator` to turn it into a persisted project skill if this need recurs.
