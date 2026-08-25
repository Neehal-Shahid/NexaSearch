# DECISIONS.md — Nexa Search

Architectural choices and the reasoning/trade-offs behind them, inferred from the code, comments, commit history, and the developer's own case-study writeup (`nexa_case_study.md`). Where a decision looks like an accepted shortcut rather than a deliberate long-term choice, that's called out explicitly.

## No backend database — localStorage only

**Decision**: Search history and saved/bookmarked results are stored entirely in browser `localStorage`, wrapped in try/catch-safe helpers (`src/utils/localStorage.js`).

**Why**: This is a solo portfolio project without user accounts. A database + auth system would add real infrastructure cost and complexity for a demo whose purpose is to showcase frontend craft (per `nexa_case_study.md`, the pitch is entirely about UI feel — "calm," "premium," "smooth animations" — not about backend features).

**Trade-off accepted**: No cross-device sync, no data survives a cleared browser, and (see below) the "admin" feature flags meant to look like platform-wide controls are actually just one more localStorage key each.

## Vercel serverless functions as a thin proxy layer, never a real backend

**Decision**: `api/search.js`, `api/chat.js`, `api/admin.js` exist for exactly one reason each: keep `SERPAPI_KEY`/`SERPAPI_KEY_2`/`GEMINI_API_KEY` off the client. They do no business logic beyond request shaping, key rotation, and response pass-through.

**Why**: SerpAPI and Gemini require secret API keys; a static SPA can't hide those without a server hop. Vercel functions are the minimal-infrastructure way to add that hop while keeping the rest of the app a plain static SPA (`vercel.json`'s rewrite sends everything else straight to `index.html`).

## Dual SerpAPI key rotation

**Decision**: `SERPAPI_KEY` and `SERPAPI_KEY_2` are both accepted; `api/search.js` tries them in order, only advancing to the next key on a 429/402 (quota-exceeded) response, and `AdminPage` exposes a manual override (`nexa_primary_key` in localStorage) to force the backup key first.

**Why**: SerpAPI's free/low tiers have tight monthly quotas. Two keys roughly double the effective quota for a demo project without paying for a higher tier. The manual override exists so the developer can drain a specific key's quota intentionally (e.g. for testing) via the admin panel.

## AdminPage authentication (fixed 2026-08-25)

**Original state, not a deliberate hardening decision**: `AdminPage.jsx` and `/api/admin` were both fully open — no login, no token, no route guard. Anyone who navigated to `/admin` could see SerpAPI/Gemini account emails and usage numbers and flip the feature-flag checkboxes (which only affects *their own* browser, since the flags are localStorage-based — see below). This read as an accepted risk of a single-developer demo project rather than an intentional design choice — there was no comment or "TODO: add auth" marker anywhere near it.

**Fix chosen**: a single shared secret (`ADMIN_SECRET` env var, server-side only) checked in `api/admin.js` against an `x-admin-key` request header, with `AdminPage.jsx` gating the dashboard behind a password-entry screen (key kept in `sessionStorage`, not `localStorage`, so it doesn't persist indefinitely like a "remember me").

**Why this shape, not something more**: There's still no user/account system and no database, so a real login (sessions, hashed passwords, multi-user roles) is out of scope by the project's own constraints. A shared secret is the cheapest mechanism that still meaningfully closes the "anyone with the URL" hole — comparable to how the SerpAPI/Gemini keys themselves are protected (a secret only the server knows). It's not multi-user-safe or rotation-friendly, but that's an acceptable trade-off for a single-operator admin panel.

**Trade-off accepted**: If `ADMIN_SECRET` isn't set (e.g. freshly deployed without configuring it on Vercel), `/api/admin` fails closed with 503 rather than silently staying open — deliberately chosen over fail-open, even though it means the developer has to remember to set the env var before `/admin` works at all.

## "Local Platform Controls" are actually per-browser flags, not platform config

**Decision** (or more precisely, naming choice): `AdminPage.jsx` labels its checkboxes/select "Local Platform Controls," but they write directly to `localStorage` (`admin_disable_ai`, `admin_disable_media_packs`, `nexa_primary_key`), which only affects the browser that set them.

**Why**: Simplest possible implementation for a feature-flag mechanism with no backend to persist global config to. The "Local" in the label is the honest part of the name; it's easy to misread the rest of the label as "site-wide."

**Trade-off accepted**: Toggling "disable AI" in the admin panel on one machine does nothing for any other visitor. If this is meant to be a real kill-switch someday, it needs to move server-side (e.g. an env var or a tiny KV store `api/*` reads).

**2026-08-25 update**: the three flag keys (`admin_disable_ai`, `admin_disable_media_packs`, `nexa_primary_key`) were previously scattered as raw string literals across `AdminPage.jsx`, `SearchPage.jsx`, `SearchTabs.jsx`, and `searchClient.js` — a typo in any one of them would have silently broken that flag with no error. They're now centralized as `FEATURE_FLAGS` in `src/constants/index.js`. This didn't change the "per-browser, not global" nature described above, just removed the magic-string risk.

## Content moderation is a keyword filter, not a real safety boundary — now enforced both sides (updated 2026-08-25)

**Decision**: `src/utils/moderation.js`'s `isAdultQuery()` does keyword/phrase matching (with a medical-terms allowlist to reduce false positives like "breast cancer"). Originally this only ran client-side, inside `SearchPage.jsx` — the real SerpAPI call was simply skipped and a themed message (with a randomly chosen inspirational quote — the quote set is explicitly religious/Quranic in this codebase) was shown instead.

**Why**: For a portfolio search engine, a lightweight, zero-infrastructure content filter demonstrates intent and covers the casual case without needing a moderation API or server-side policy engine. The quote screen turns a "blocked" state into a designed UX moment rather than a bare error, consistent with the project's "calm, premium" design goal.

**Gap closed 2026-08-25**: the client-side check alone was trivially bypassed by hitting `/api/search` directly (skip the UI entirely). `api/search.js` now imports the same `isAdultQuery()` and re-runs it server-side, returning 403 before ever calling SerpAPI. This was a genuinely free fix — no new infrastructure, just reusing the existing pure function from the server function that was already the sole gateway to SerpAPI.

**Trade-off still accepted**: it's still keyword matching, not real moderation (no ML classifier, no third-party moderation API) — a determined user can still phrase around it. What changed is that the check can no longer be skipped just by not going through the browser UI; the browser is no longer a trusted enforcement point on its own.

## Two independent markdown renderers instead of one shared one

**Observed**: `src/utils/markdown.js` (a fuller regex-based parser: headings, lists, blockquotes, hr, code blocks with copy button) is used by `AiMode.jsx`. `NexaOverview.jsx` hand-rolls its *own*, separate, more limited inline formatter (bold/italic/inline-code only) rather than importing `utils/markdown.js`.

**Why this likely happened**: Per commit history (`741bf84 "Enhance NexaOverview with full media support, videos, and regex markdown parsing"`), `NexaOverview`'s formatting needs grew organically alongside its own media-rendering logic and was never refactored to reuse the shared parser. This looks like incremental feature-by-feature development rather than a deliberate "these need different parsers" decision — the two could plausibly be unified.

## Duplicated Gemini fallback-chain logic (3 call sites) — audited, deliberately left un-unified

**Observed**: `AiMode.jsx`, `CurrencyConverterBox.jsx`, and `TranslationBox.jsx` each independently implement "call `/api/chat` with `gemini-3.5-flash-lite`, on failure retry with `gemini-3.1-flash-lite`." Not extracted into a shared hook/util.

**Why this likely happened**: Each widget was built when needed, copying the pattern that already worked in `AiMode`, without a refactor pass afterward.

**Why it wasn't consolidated during the 2026-08-25 audit cleanup**: the three implementations are not actually identical in behavior, which only became clear on close reading. `CurrencyConverterBox`/`TranslationBox` fall back to the second model on *any* failure, including a non-2xx HTTP response from `/api/chat`. `AiMode` does not: on a non-2xx response it explicitly throws an `Error` whose message contains `"API Error"`, and its catch block only *continues to the next model* when the caught error's message does **not** contain that string — meaning `AiMode` only ever falls back to `gemini-3.1-flash-lite` on a network-level failure (e.g. `fetch` itself throwing), not on an HTTP error response from the first model. Extracting a shared helper based on the more common (Currency/Translation) pattern would silently change `AiMode`'s fallback behavior — arguably fixing a latent bug in it, but that's a judgment call the user didn't ask for and wasn't the point of this cleanup pass. Left as three call sites; worth consolidating deliberately in a future pass that decides which fallback behavior is actually correct for `AiMode`.

## Lazy-loading every route except HomePage

**Decision**: `App.jsx` eagerly imports only `HomePage`; every other page is `React.lazy()` behind a single shared `<Suspense>` boundary.

**Why**: Standard Vite/React code-splitting to keep the first paint (the landing page) fast, since `HomePage` is overwhelmingly the most common entry point for a search engine. Explicitly commented in `App.jsx`: "Lazy-load secondary pages for smaller initial bundle."

## Custom regex markdown parser instead of a library (e.g. `marked`, `react-markdown`)

**Decision**: Hand-rolled `parseMarkdown()` in `src/utils/markdown.js` rather than pulling in a markdown dependency.

**Why**: `package.json` has zero markdown/sanitization dependencies — this keeps the bundle small and avoids adding a dependency for what is a fairly narrow subset of markdown (bold/italic/links/lists/headings/code/blockquotes/hr) driven by Gemini's own output style, which the developer controls the prompt for (see `systemInstruction` in `api/chat.js` asking Gemini to "use markdown (like **bold** and * lists)").

**Trade-off accepted**: No real sanitization beyond escaping `<`/`>` inside code spans — output is trusted because it originates from the app's own Gemini prompt, not arbitrary user-supplied HTML. This assumption would need revisiting if the app ever rendered markdown from a less-trusted source.

## Best-effort in-memory rate limiting instead of a real rate-limit store (added 2026-08-25)

**Decision**: `api/_lib/rateLimit.js` implements per-IP request throttling with a plain in-memory `Map`, capped at 1000 tracked keys with FIFO eviction, applied to `/api/search`, `/api/chat`, and `/api/admin`.

**Why**: The project's explicit constraint is no backend, no database, Vercel-only. A "real" rate limiter (Redis/Upstash/Vercel KV) would need exactly the infrastructure this project has deliberately avoided. An in-memory counter costs nothing to add and meaningfully blocks the common abuse case — a script or bot hammering one endpoint repeatedly — as long as it keeps landing on the same warm serverless instance, which is the typical case for a low-traffic app.

**Trade-off accepted**: This is explicitly **not** reliable rate limiting under real scale-out — Vercel can spin up multiple concurrent instances of the same function under load, each with its own independent counter, and any instance's counter resets on cold start. It should be understood as raising the cost of casual abuse, not as a guarantee. If real traffic ever justifies it, this needs a shared store — at which point the "no backend" constraint would need to be revisited anyway.

## Vite dev middleware re-implements the serverless functions instead of importing them

**Observed**: `vite.config.js` contains a second, hand-copied implementation of `api/search.js`'s and `api/admin.js`'s logic (as Vite middleware), rather than the dev server importing/calling the actual `api/*.js` handler files.

**Why this likely happened**: Vercel dev (`vercel dev`) can run the real functions locally with proper parity, but this project instead uses plain `vite dev`, which has no built-in concept of `/api` serverless functions — so the developer wrote parallel middleware to fill the gap. `/api/chat` avoided this problem entirely by using Vite's built-in HTTP proxy instead of reimplementing the Gemini call, which is why only `search`/`admin` have this duplication risk, not `chat`.

**Trade-off accepted**: The two search/admin implementations can silently drift (e.g. the dev version of `/api/admin` also injects fake `recentActivity`/`topQueries` data that doesn't exist in production's `api/admin.js` at all).
