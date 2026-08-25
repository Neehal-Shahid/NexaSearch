# CLAUDE.md — Nexa Search

This file is the entry point for any AI assistant (or human) picking up this project cold. It orients you fast, then points to the other docs for depth.

## What this project is

**Nexa Search** is a portfolio/demo search engine web app — a minimal, "premium calm" front-end for Google Search results (via SerpAPI) with an integrated Gemini-powered AI chat/overview mode. Single developer project (per commit history: `Neehal-Shahid`), deployed on Vercel.

Read `nexa_case_study.md` for the developer's own pitch/description of the product (design goals: calm, uncluttered, teal-on-white premium aesthetic).

## Companion docs — read these for depth

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** — full file/folder map with a one-line purpose for every file.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — how data flows: routing, API layer, contexts, request lifecycle, rendering strategy.
- **[DECISIONS.md](DECISIONS.md)** — why things are built the way they are (and known trade-offs/hacks accepted along the way).
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** — what's done, what's broken, what's unfinished, open TODOs.

## Tech stack

- React 18.3 + Vite 5.4, plain JSX (no TypeScript)
- react-router-dom 6.26 (client-side routing, `BrowserRouter`)
- Tailwind CSS 3.4 (custom theme: teal `#003747` accent, near-white/near-black neutrals)
- No global state library — React Context (`SavedResultsContext`, `SearchHistoryContext`) + `localStorage`
- No backend/database — all persistence is browser `localStorage`
- Vercel serverless functions in `/api` as the only server-side code
- External APIs: **SerpAPI** (Google search results) and **Google Gemini** (`gemini-3.5-flash-lite` / `gemini-3.1-flash-lite`, AI chat + overview + translation + currency conversion)
- Linting: `oxlint` (`.oxlintrc.json`), not ESLint

## Running it

```
npm run dev      # Vite dev server; vite.config.js has a custom middleware that
                  # re-implements /api/search and /api/admin for local dev, and
                  # proxies /api/chat straight to Gemini
npm run build     # production build
npm run preview
```

Requires a `.env` (gitignored) with `SERPAPI_KEY`, `SERPAPI_KEY_2` (optional backup), and `GEMINI_API_KEY`. **Never** expose these client-side — they're read only inside `/api/*.js` and the Vite dev middleware.

## Things to know before touching this code

1. **`/admin` has no authentication whatsoever** — neither the page nor `/api/admin`. Anyone who finds the URL can see SerpAPI/Gemini account emails and usage stats, and flip the "Local Platform Controls" (which are actually just this-browser-only `localStorage` flags, not real platform config, despite the label). See PROJECT_STATUS.md and DECISIONS.md.
2. **Content moderation is entirely client-side.** `src/utils/moderation.js` keyword-matches queries in the browser and swaps in a quotes screen instead of calling the search API — trivially bypassable, not a real safety boundary.
3. **Gemini call boilerplate is duplicated 3x** (`AiMode.jsx`, `CurrencyConverterBox.jsx`, `TranslationBox.jsx`) — same model-fallback-chain logic copy-pasted, not extracted into a shared hook.
4. **Two markdown parsers exist**: `src/utils/markdown.js` (full parser, used by `AiMode.jsx`) and a second, separate inline formatter hand-rolled inside `NexaOverview.jsx`. They are not the same code.
5. **`api/search.js`'s SerpAPI-proxy logic is duplicated in `vite.config.js`** (as dev middleware) — if you change one, check the other, they can drift.
6. There's a **known, currently-unresolved bug** in the translation flow — see `prompt.md` at repo root (the developer's own bug report) and PROJECT_STATUS.md.
7. Result-rendering components follow a strong **defensive-rendering convention** (guard clauses, `Array.isArray` checks, `onError` on images) because SerpAPI's response shapes are inconsistent and have previously caused white-screen crashes (see recent commit history). Keep new result components consistent with this pattern — see ARCHITECTURE.md.
8. There is now an app-wide **`ErrorBoundary`** (`src/components/ui/ErrorBoundary.jsx`, wired into `App.jsx` around the routed page content, added 2026-08-25) that catches render errors and shows a recoverable fallback instead of a blank white page, auto-resetting on navigation. It's a safety net for defensive-rendering gaps that slip through — not a reason to skip the guard clauses in point 7. See PROJECT_STATUS.md for the crash it was added to fix.

## Conventions this codebase already follows (match them)

- Functional components only, hooks-based, no class components.
- Pages live in `src/pages/`, are lazy-loaded in `App.jsx` (except `HomePage`), and wrapped in `<Suspense>`.
- All result-rendering components live under `src/components/results/` and take raw SerpAPI-shaped `data`/`result` props directly — no intermediate normalization layer.
- Feature flags and per-browser admin toggles are plain `localStorage` keys read inline where needed (`admin_disable_ai`, `admin_disable_media_packs`, `nexa_primary_key`) — not centralized.
- Comments are sparse and only explain *why* (e.g. "Force re-render hack"), matching this project's own style.
