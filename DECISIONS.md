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

## AdminPage has no authentication

**Observed, not a deliberate hardening decision**: `AdminPage.jsx` and `/api/admin` are both fully open — no login, no token, no route guard. Anyone who navigates to `/admin` sees SerpAPI/Gemini account emails and usage numbers and can flip the feature-flag checkboxes (which only affects *their own* browser, since the flags are localStorage-based — see below).

**Why this likely happened**: This reads as an accepted risk of a single-developer demo project rather than an intentional design choice — there's no comment, guard stub, or "TODO: add auth" marker anywhere near it. The blast radius is limited (no write access to real infrastructure, no PII beyond the developer's own API account emails, flag toggles are per-browser not global), which is probably why it's been left as-is. **This should be flagged to the user explicitly if the app is ever pointed at a non-throwaway API key or exposed beyond a portfolio demo.**

## "Local Platform Controls" are actually per-browser flags, not platform config

**Decision** (or more precisely, naming choice): `AdminPage.jsx` labels its checkboxes/select "Local Platform Controls," but they write directly to `localStorage` (`admin_disable_ai`, `admin_disable_media_packs`, `nexa_primary_key`), which only affects the browser that set them.

**Why**: Simplest possible implementation for a feature-flag mechanism with no backend to persist global config to. The "Local" in the label is the honest part of the name; it's easy to misread the rest of the label as "site-wide."

**Trade-off accepted**: Toggling "disable AI" in the admin panel on one machine does nothing for any other visitor. If this is meant to be a real kill-switch someday, it needs to move server-side (e.g. an env var or a tiny KV store `api/*` reads).

## Content moderation is a client-side keyword filter, not a real safety boundary

**Decision**: `src/utils/moderation.js`'s `isAdultQuery()` does keyword/phrase matching (with a medical-terms allowlist to reduce false positives like "breast cancer") entirely in the browser, inside `SearchPage.jsx`. If it flags a query, the real SerpAPI call is simply skipped and a themed message (with a randomly chosen inspirational quote — the quote set is explicitly religious/Quranic in this codebase) is shown instead.

**Why**: For a portfolio search engine, a lightweight, zero-infrastructure content filter demonstrates intent and covers the casual case without needing a moderation API or server-side policy engine. The quote screen turns a "blocked" state into a designed UX moment rather than a bare error, consistent with the project's "calm, premium" design goal.

**Trade-off accepted**: This is trivially bypassed (disable JS, edit localStorage, hit `/api/search` directly) — it is not a security or compliance control, only a soft UX nudge. Should not be relied on as a real safety boundary if this app is ever made public-facing at scale.

## Two independent markdown renderers instead of one shared one

**Observed**: `src/utils/markdown.js` (a fuller regex-based parser: headings, lists, blockquotes, hr, code blocks with copy button) is used by `AiMode.jsx`. `NexaOverview.jsx` hand-rolls its *own*, separate, more limited inline formatter (bold/italic/inline-code only) rather than importing `utils/markdown.js`.

**Why this likely happened**: Per commit history (`741bf84 "Enhance NexaOverview with full media support, videos, and regex markdown parsing"`), `NexaOverview`'s formatting needs grew organically alongside its own media-rendering logic and was never refactored to reuse the shared parser. This looks like incremental feature-by-feature development rather than a deliberate "these need different parsers" decision — the two could plausibly be unified.

## Duplicated Gemini fallback-chain logic (3 call sites)

**Observed**: `AiMode.jsx`, `CurrencyConverterBox.jsx`, and `TranslationBox.jsx` each independently implement "call `/api/chat` with `gemini-3.5-flash-lite`, on failure retry with `gemini-3.1-flash-lite`." Not extracted into a shared hook/util.

**Why this likely happened**: Each widget was built when needed, copying the pattern that already worked in `AiMode`, without a refactor pass afterward. Reasonable candidate for consolidation if a fourth Gemini-calling feature is ever added.

## Lazy-loading every route except HomePage

**Decision**: `App.jsx` eagerly imports only `HomePage`; every other page is `React.lazy()` behind a single shared `<Suspense>` boundary.

**Why**: Standard Vite/React code-splitting to keep the first paint (the landing page) fast, since `HomePage` is overwhelmingly the most common entry point for a search engine. Explicitly commented in `App.jsx`: "Lazy-load secondary pages for smaller initial bundle."

## Custom regex markdown parser instead of a library (e.g. `marked`, `react-markdown`)

**Decision**: Hand-rolled `parseMarkdown()` in `src/utils/markdown.js` rather than pulling in a markdown dependency.

**Why**: `package.json` has zero markdown/sanitization dependencies — this keeps the bundle small and avoids adding a dependency for what is a fairly narrow subset of markdown (bold/italic/links/lists/headings/code/blockquotes/hr) driven by Gemini's own output style, which the developer controls the prompt for (see `systemInstruction` in `api/chat.js` asking Gemini to "use markdown (like **bold** and * lists)").

**Trade-off accepted**: No real sanitization beyond escaping `<`/`>` inside code spans — output is trusted because it originates from the app's own Gemini prompt, not arbitrary user-supplied HTML. This assumption would need revisiting if the app ever rendered markdown from a less-trusted source.

## Vite dev middleware re-implements the serverless functions instead of importing them

**Observed**: `vite.config.js` contains a second, hand-copied implementation of `api/search.js`'s and `api/admin.js`'s logic (as Vite middleware), rather than the dev server importing/calling the actual `api/*.js` handler files.

**Why this likely happened**: Vercel dev (`vercel dev`) can run the real functions locally with proper parity, but this project instead uses plain `vite dev`, which has no built-in concept of `/api` serverless functions — so the developer wrote parallel middleware to fill the gap. `/api/chat` avoided this problem entirely by using Vite's built-in HTTP proxy instead of reimplementing the Gemini call, which is why only `search`/`admin` have this duplication risk, not `chat`.

**Trade-off accepted**: The two search/admin implementations can silently drift (e.g. the dev version of `/api/admin` also injects fake `recentActivity`/`topQueries` data that doesn't exist in production's `api/admin.js` at all).
