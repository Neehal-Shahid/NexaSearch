# PROJECT_STATUS.md — Nexa Search

Snapshot as of **2026-08-25**, based on the working tree at commit `872ab2f` + uncommitted fixes below (branch `main`). Update this file as things change — it decays fast.

## What's working / shipped

- Core search flow across all 6 types (web/ai/images/news/videos/shopping), URL-param-driven, with abortable requests and an in-memory response cache.
- Dual SerpAPI key rotation with automatic quota-based failover.
- Gemini-powered AI Overview (inline card) and full AI Mode chat, with a two-model fallback chain.
- Answer-box widgets: weather, currency converter (live via Gemini), translator (live via Gemini), sports scoreboard, knowledge panel, people-also-ask, related searches, local/map results.
- Search history (grouped by date, timeframe-based clearing with a confirm modal) and saved/bookmarked results (filterable by type), both localStorage-backed.
- Command palette (Cmd/Ctrl+K), mobile nav, keyboard shortcuts (`/` to focus search).
- Static pages: About, Privacy, Terms.
- Admin usage dashboard (SerpAPI + Gemini account metrics).
- Defensive rendering hardened after real white-screen crashes from inconsistent SerpAPI response shapes — most recently a class of these was fixed app-wide, see below.

## Just fixed (2026-08-25) — "Read full overview" white-screen crash

**Symptom reported**: clicking "Read full overview" on the AI Overview card sometimes produced a loading flash then a blank white page, and the same blank-page pattern showed up elsewhere in the app too, requiring a manual refresh to recover.

**Root cause, two layers**:
1. `NexaOverview.jsx` only renders `blocks.slice(0, 2)` until expanded. Clicking "Read full overview" is the *first* time `blocks[2+]` ever gets mapped over, and that map accessed `block.title`/`block.snippet`/`block.list`/`block.code`/`block.link` directly with no check that `block` itself was a real object. When SerpAPI's `ai_overview.text_blocks` contained a null/malformed entry past index 1 (intermittent, depends on the query), this threw a TypeError on render.
2. **There was no React Error Boundary anywhere in the app.** Any single uncaught render error — this one, or the already-known unguarded `new URL(result.link)` in `ImagePreviewModal.jsx` — unmounted the *entire* React tree, hence "blank page in other places too" and "have to refresh to get back."

**Fixes applied**:
- `src/components/results/NexaOverview.jsx`: skip non-object block entries before rendering (`if (!block || typeof block !== 'object') return null`), and `filter(Boolean)` the `data.videos`/`data.images` media-strip arrays before mapping (same null-entry risk).
- `src/components/results/ImagePreviewModal.jsx`: replaced the unguarded `new URL(result.link).hostname` with `extractDomain(result.link)` (the existing try/catch-safe util from `src/utils/formatters.js`) — closes the previously-known gap noted below.
- **New**: `src/components/ui/ErrorBoundary.jsx` — a real class-based React error boundary with a friendly fallback (reload / go home), added app-wide. Wired into `src/App.jsx` around the routed page content (`AppRoutes`), keyed to `location.pathname + location.search` so it **auto-recovers on navigation** — if a page crashes, clicking any nav link/logo/command-palette entry clears the error without a manual page reload. This is the general-purpose fix: any *future* render error in page content now degrades to a recoverable fallback instead of blanking the whole app.

Verified with `npm run build` — clean build, no errors.

## Just fixed (2026-08-25, second pass) — audit cleanup

Following a full codebase audit, the fixable items that didn't require adding a real backend/database were addressed (this app remains frontend + Vercel serverless only):

**Security / cost exposure**
- **`/admin` now requires a shared secret.** `api/admin.js` checks an `x-admin-key` header against the new `ADMIN_SECRET` env var (added as an empty placeholder in `.env` — **you must set a real value locally and in the Vercel project's env vars, or the endpoint returns 503 "not configured"**). `AdminPage.jsx` now shows a password-gate screen before the dashboard; the key is kept in `sessionStorage` (cleared on tab close), not `localStorage`. `vite.config.js`'s dev middleware mirrors the same check for local-dev parity.
- **Server-side moderation enforcement.** `api/search.js` now also runs `isAdultQuery()` (imported from `src/utils/moderation.js`) before proxying to SerpAPI, returning 403 if flagged — closes the previous gap where calling `/api/search` directly bypassed the client-side-only check entirely. `vite.config.js`'s dev middleware mirrors this too. Still a soft keyword filter, not real moderation — see DECISIONS.md.
- **Best-effort rate limiting + input caps**, new `api/_lib/rateLimit.js` (in-memory, per-warm-instance — no DB, so not reliable across scale-out, but stops the common single-instance abuse case at zero infra cost): `/api/search` (30 req/min/IP, query capped at 200 chars), `/api/chat` (20 req/min/IP, payload capped at 20,000 chars — this endpoint is otherwise an open proxy to Gemini), `/api/admin` (10 req/min/IP).

**Correctness / dead code**
- `TranslationBox.jsx` now guards `data.source?.text`/`.language` and `data.target?.text`/`.language` individually instead of assuming they exist.
- `CustomSelect.jsx` now guards `options` with `Array.isArray()` before filtering.
- `SaveButton.jsx` now returns `null` if `result.link` is missing, instead of risking mis-deduping link-less saved items.
- `AdminPage.jsx`'s "force re-render hack" (`setData({...data})` to force a re-render after a `localStorage` write) is gone — feature flags are now real React state, updated through proper setters.
- `alert()` on "Purge Global Cache" replaced with the app's existing (previously unused/orphaned) `Toast` component.
- Removed dead code: unused `useNavigate` import in `HomePage.jsx`, unused `isLoadingAi` state in `SearchPage.jsx`.
- `AboutPage.jsx` now sets `document.title`/scrolls to top on mount, matching `PrivacyPage.jsx`/`TermsPage.jsx`.
- Feature-flag `localStorage` keys (`admin_disable_ai`, `admin_disable_media_packs`, `nexa_primary_key`) centralized into `FEATURE_FLAGS` in `src/constants/index.js`, replacing scattered magic strings across `AdminPage.jsx`, `SearchPage.jsx`, `SearchTabs.jsx`, `searchClient.js`.

**Deliberately left alone** (real but higher-risk to touch without behavior changes — see DECISIONS.md):
- The three duplicated Gemini fallback-chain implementations (`AiMode`, `CurrencyConverterBox`, `TranslationBox`) — **not** unified. `AiMode`'s fallback only actually triggers on a network-level fetch failure (it rethrows and stops on any HTTP-level error response), while `CurrencyConverterBox`/`TranslationBox` fall back to the second model on HTTP errors too. Unifying them would silently change `AiMode`'s behavior, which wasn't asked for.
- The two markdown parsers (`utils/markdown.js` vs. `NexaOverview.jsx`'s inline formatter) — not merged, since they render different feature sets today and merging risks visible layout/formatting changes in one of the two contexts.

Verified: `npm run build` (clean), plus manual smoke tests — `/api/admin` → 503 with no `ADMIN_SECRET` set, `/api/search?q=porn` → 403, `/api/search?q=` → 400, `/api/search?q=hello+world` → 200, and a standalone check that the rate limiter trips exactly at request #31 for a limit of 30.

## Known bugs (unresolved)

1. **Translation box re-search bug** — documented by the developer directly in `prompt.md` at repo root (their own bug report, not yet acted on as of this snapshot). Summary: after the first search producing a translation box + AI overview + web results, editing the translation input and pressing enter is expected to update *only* the translation pane. Instead it appears to trigger a full page/search refresh — the search bar still shows the original query, the AI overview and translation stay stale/unchanged, but the underlying SERP web results silently change to reflect the new translation text. This points to `TranslationBox.jsx`'s input handling incorrectly triggering (or interacting with) the parent search/navigation flow instead of staying self-contained. **Not yet fixed** — no corresponding commit found in recent history.

## Known gaps / incomplete features

- **AI Overview pagination is unimplemented.** `SearchPage.jsx` has explicit logic acknowledging that when SerpAPI returns only a `page_token` (no `text_blocks`) for `ai_overview`, that token should be used to fetch the rest — the code comment says "Handle token logic later." Currently, such overviews simply don't render further content.
- **Content moderation (`isAdultQuery`) is still a soft keyword filter**, not real moderation — it's now enforced both client- and server-side (see above), so it's no longer trivially bypassed by calling `/api/search` directly, but it's still just keyword matching, not a real safety/compliance boundary.
- **Rate limiting is best-effort, in-memory, per-warm-instance** — there's no database/Redis in this project, so it doesn't hold under real multi-instance scale-out on Vercel. It's a meaningful improvement over having nothing, not a substitute for a real rate-limiting service if this app ever gets real traffic.
- **Portfolio-only hardcoded demo hack**: `SearchPage.jsx` synthesizes a fake translation `answer_box` when the query contains both "translate" and "urdu" and SerpAPI didn't return a real one — this is explicitly a demo-polish hack, not general logic, and only fires for that specific phrase pattern.
- Two independent markdown renderers (`utils/markdown.js` vs. `NexaOverview.jsx`'s inline formatter) and three duplicated Gemini-call-with-fallback implementations (`AiMode`, `CurrencyConverterBox`, `TranslationBox`) — functional today, deliberately left un-unified (see "Just fixed" above and DECISIONS.md).
- Privacy/Terms pages have a hardcoded "Last Updated: August 2026" string — will silently go stale since it's not derived from anything.
- Dev-only scratch files at repo root (`list_models.mjs`, `scratch_test.mjs`, `test_currency.mjs`, `test_gemini.mjs`, `test_logo.html`, `test_serp.cjs`) are ad-hoc debugging scripts, not part of the build — safe to ignore or clean up, not referenced by `src/`.
- **`ADMIN_SECRET` must be set for `/admin` to work at all** — it's an empty placeholder in `.env` and not yet set on Vercel's production env vars. Until it's set, `/api/admin` returns 503 everywhere, including for you.

## Recent development activity (from git log, most recent first)

- `872ab2f` Fix critical white screen crash in NexaOverview by deeply type-checking all dynamic SerpAPI data before React render
- `741bf84` Enhance NexaOverview with full media support, videos, and regex markdown parsing
- `361ff7a` Enhance NexaOverview to render lists and external video links
- `cf32ff8` Fix critical runtime error causing white screen crash on History Page
- `32afc58` Add custom beautiful ConfirmModal for history deletion
- `8f0ddf0` Update history clear button to use minimal accent styling
- `0c6875b` Convert native clear history select into custom Nexa UI dropdown
- `27abe28` Add API key toggle in admin and advanced time-based history clearing
- `c2c6dc1` Fix SearchTabs to scroll to top on tab change for better UX
- `b4a5634` Fix search bar clear button to only clear input and retain focus without redirecting
- `dde2019` Expand moderation quotes with specific verses on Zina, death, and repentance
- `f1adaed` Update moderation algorithm with medical bypass rules and expanded adult keyword list
- `abd09d6` / `6f0b555` Update admin dashboard to track Gemini key and remove fake data
- `6c58d86` Add links, quotes, and strikethrough support to AI markdown engine
- `6cfd421` Fix list numbering and widen AI chat bubbles
- `d2de4b5` Apply Nexa accent color to code block headers

**Reading the trend**: development has recently focused heavily on (1) hardening `NexaOverview`/History against SerpAPI's inconsistent data shapes causing crashes, (2) polishing the AI markdown rendering, and (3) building out the admin dashboard and history-clearing UX. The translation-box bug in `prompt.md` looks like the next item queued up but not yet started.

## Suggested next steps (not yet actioned — for planning only)

1. **Set `ADMIN_SECRET`** in `.env` (local) and in the Vercel project's environment variables (production) — `/admin` is non-functional (503) until this is done.
2. Fix the translation-box re-search bug (`prompt.md`) — highest priority active bug.
3. Implement or explicitly drop the AI Overview `page_token` pagination TODO.
4. Consider auditing other `.map()` calls over SerpAPI/Gemini-sourced arrays for the same "assumes every entry is a non-null object" gap that caused the `NexaOverview` crash — the `ErrorBoundary` will now catch any that remain, but fixing them at the source is still better than relying on the fallback UI.
5. If this app ever needs real (not best-effort) rate limiting or admin auth beyond a shared secret, that requires actual infrastructure (e.g. Vercel KV/Upstash for a shared rate-limit store, or a real auth provider) — out of scope while this stays a no-backend, no-database, Vercel-only project.
