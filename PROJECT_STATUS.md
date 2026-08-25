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

## New feature (2026-08-25, eleventh pass) — real keyboard-driven Command Palette + live trending topics

**Requested**: make Cmd/Ctrl+K "real usable," and source genuine trending topics instead of the hardcoded static list.

**Command Palette rewrite** (`src/components/search/CommandPalette.jsx`): it used to stop being interactive the moment you typed anything — no live filtering, no arrow-key navigation through Recent/Trending/Navigation (unlike `SearchBar`, which already had that), just "press Enter to search." Rewritten around one flat, keyboard-navigable item list built from Recent Searches + Trending + Navigation, filtered live as you type (whole-item substring match), with full arrow-key selection, Enter-to-activate, mouse-hover-to-highlight, auto-scroll-into-view for the highlighted item, and a per-recent-item remove (×) button matching `SearchBar`'s existing suggestion-dropdown pattern. A free-text "Search for '...'" action is always appended when there's a query, so typing something that matches nothing still lets you search. The Navigation section was also expanded from 3 destinations (Home/Saved/History) to all 7 (added About, Privacy, Terms, Admin) — clicking through to Admin still requires the `ADMIN_SECRET` password screen, this is just a shortcut to the URL, not a bypass.

**Live trending topics, not hardcoded**: verified that SerpAPI's `google_trends_trending_now` engine returns genuine real-time trending searches (tested against the real API key — 400 items with query text, search volume, category). New `api/trending.js` (mirrored in `vite.config.js`'s dev middleware, geo defaults to `'US'` in dev since there's no geolocation header locally) proxies this, filtered through the same `isAdultQuery()` moderation check used everywhere else, capped at 12 items, cached for 15 minutes (`s-maxage=900`) since trending topics don't need to be second-fresh and this is a supplementary/decorative feature not worth spending SerpAPI quota on aggressively. New `src/hooks/useTrendingSearches.js` fetches it with a module-level shared cache (so CommandPalette and the homepage don't each fire their own request) and falls back silently to the existing static `TRENDING_SEARCHES` list on any failure — a broken trending fetch should never surface an error, it's decoration, not a core feature.

**Bonus find while wiring this up**: `src/components/search/TrendingSearches.jsx` was fully built and exported but never actually imported/rendered anywhere in the app — dead code. Wired it into `HomePage.jsx` (below the hero search bar) using the new live data, since it directly serves the "how do we surface trending topics" question and was sitting there unused.

Verified: `npm run build` clean; `/api/trending` tested live end-to-end through the dev server (12 real trending items returned); the palette's filter/build-list logic tested standalone against several query cases (nav-only match, recent-only match, no-match-falls-back-to-free-text, empty-query full sectioned list) — all correct.

## Just fixed (2026-08-25, tenth pass) — stale AI Overview persisted across an unrelated new query

**Symptom reported**: search "how to cook pasta" (AI overview appears, correct) → follow up into AI Mode (correct) → type a completely new, unrelated query ("does nobita really married shizuka") into the search bar while still on the AI Mode tab → lands on the All tab with correct SERP results for the new query, **but the old "how to cook pasta" AI overview is still shown above them**.

**Root cause, confirmed against the exact repro query, not just theory**: `SearchPage.jsx` had one `useEffect(() => {...}, [data, type])` responsible for both setting AND clearing `aiOverviewData`. Two compounding bugs:
1. `useSearch`'s `data` doesn't clear when `query`/`type` change — it keeps the *previous* query's data until the new fetch resolves. Since `type` flips to `web` immediately on navigation but `data` lags, there was a window where the effect's `type === 'web' && data?.ai_overview` check ran against the OLD query's (still-valid) overview, attaching it to the new query.
2. When `ai_overview` exists but only has a `page_token` (SerpAPI's deferred/paginated shape — see the existing unimplemented-pagination TODO below) and no `text_blocks`, the old effect did **nothing** — neither set nor cleared. **Verified live against the exact reported query**: `"does nobita really married shizuka"` genuinely returns `ai_overview: {page_token: "...", serpapi_link: "..."}` with no `text_blocks`. Hitting this branch meant whatever was already showing (the wrongly-attached pasta overview from bug #1) had nothing left to ever correct it — it froze permanently instead of just flashing.

**Fix**: split into two effects. One resets `aiOverviewData` to `null` immediately on `[query, type, page]` change (closes the race — there's genuinely nothing valid to show until the new data arrives). The other populates it only when the *current* `data` has real `text_blocks` (closes the freeze — a `page_token`-only response is now correctly treated the same as "no overview available," per the principle: show it only if SerpAPI actually returned renderable content for *this* query, otherwise don't.

**QA audit performed** (user explicitly asked to check for similar bugs elsewhere): every other piece of state derived from search results via a separate `useState`+`useEffect` (the specific pattern responsible here) was checked for the same "silent no-op leaves stale state" shape. `answerBox` is memo-based with no no-op branch (safe, already fixed earlier this session for a related but distinct reference-stability issue). `TranslationBox`/`CurrencyConverterBox`'s sync effects unconditionally set every field, no partial branches. `AiMode.jsx` was already fixed earlier this session for the analogous "stale chat persists" bug. `knowledgeGraph`/`relatedSearches`/`localResults`/`sportsResults`/`peopleAlsoAsk`/`results` are all plain values recomputed fresh from `data` every render with no separate persisted state — nothing there can get permanently stuck. `aiOverviewData` was the only instance of this specific vulnerability. `npm run build` clean.

## Just fixed (2026-08-25, ninth pass) — new search from the search bar got stuck in AI Mode

**Symptom reported**: while viewing AI Mode, typing a new unrelated query into the still-visible header search bar (e.g. "car images") and submitting it kept the user on the AI Mode tab. A real search *did* happen (visible if the user manually switched to the Images or All tab), but AI Mode itself showed no sign anything had changed.

**Two compounding bugs, both fixed**:
1. `SearchBar.jsx`'s `handleSubmit`/`handleSuggestionClick` reused whatever `type` was currently in the URL for every new query — reasonable for Images/Videos/News/Shopping (staying on a result-type tab while searching several topics in a row is a sensible workflow), but wrong for AI Mode, which isn't a results type the same way — it's a chat thread with no meaningful "these are the AI Mode results for this new query" view. Added `resolveTypeForNewQuery()`: a brand-new query submitted from the main search bar now resets to the default "All" (web) tab specifically when leaving `ai`, while every other tab keeps its existing sticky behavior unchanged.
2. Independently, `AiMode.jsx` would have shown nothing for the new query even if the user *had* stayed on the AI tab: its auto-response effect only fires when the chat history is empty or ends on an unanswered user turn — neither is true once a previous conversation has already completed, so a new query with an already-populated chat silently did nothing. Fixed by detecting a real query change (via a ref tracking the previous query) and restarting the conversation fresh when it happens, rather than leaving the stale previous chat on screen with no indication a search occurred. This also covers indirect paths back into an already-mounted AI Mode (browser back/forward between two AI-mode search URLs, etc.), not just the search-bar case.

`npm run build` clean; `resolveTypeForNewQuery` verified: `ai → web`, all other types pass through unchanged.

## Just fixed (2026-08-25, eighth pass) — admin "primary key" setting silently ignored in local dev

**Symptom reported**: admin dashboard's "Primary SerpAPI Key" control set to Key 2, but both keys' usage kept climbing on the SerpAPI account dashboard as if the setting had no effect.

**Root cause**: `vite.config.js`'s local-dev `/api/search` middleware is a separate, hand-duplicated reimplementation of `api/search.js` (a known drift risk already flagged in CLAUDE.md/DECISIONS.md) — and it never read the `keyPref` query parameter at all. It always built `apiKeys = [SERPAPI_KEY, SERPAPI_KEY_2]` in that fixed order, completely ignoring whatever preference the client sent. `api/search.js` (the real Vercel production function) already handled `keyPref` correctly — only the dev-only duplicate had the gap. Since SerpAPI tracks usage per-key at the account level regardless of which environment made the request, this meant **all local dev traffic kept draining Key 1's real quota** no matter what the admin panel said, with Key 2 only getting used as an automatic fallback once Key 1 started hitting its cap — which looks exactly like "both keys' credits going up even with Key 2 set as primary." (Key 1 was in fact sitting at 199/250 used vs. Key 2's 16/250 at the time this was found — consistent with this having been happening for a while.)

**Fix**: added the same `keyPref === '2'` check to the dev middleware that `api/search.js` already had. **Verified against real SerpAPI account data, not just code review**: recorded both keys' `this_month_usage` before and after a `keyPref=2` test request — Key 1 stayed frozen at 199, Key 2 incremented from 16 to exactly 17. Confirms the fix routes correctly.

## Just fixed (2026-08-25, seventh pass) — calculator box + over-eager video packs

User reported two Google-vs-Nexa mismatches; investigated both against real SerpAPI data rather than assuming either was a code bug:

**Calculator box for arithmetic ("what is 2 + 2", "10 + 20") — not a Nexa bug, a real SerpAPI limitation.** Verified directly against raw SerpAPI (bypassing the app's proxy entirely, multiple phrasings, with and without `hl=en&gl=us`): it never returns a calculator-style `answer_box` for basic arithmetic. It does return one for `sqrt(16)`-style expressions, but only as `type: "math_solution"` — a list of external solver links, not a computed number. Google's interactive JS calculator widget just isn't something SerpAPI's scraper captures. `AnswerBox.jsx` already has a working generic fallback (`data.snippet/answer/result/formula`) that would render this correctly if SerpAPI ever sent it — nothing to fix in Nexa's own code here. No action taken; documented so this doesn't get re-investigated as if it were a rendering bug.

**Video pack showing on nearly every query (e.g. "cow" → video carousel above web results, despite no video-related words in the query) — this WAS a real Nexa bug, now fixed.** Verified live: SerpAPI genuinely returns `inline_videos` for "cow" (3 real YouTube results) with no `top_stories`/`inline_images` — so the data itself isn't fabricated. But `SearchPage.jsx`'s intent-scoring (`getPackOrder`) only ever affected *display order*, not *visibility* — any available inline pack was shown in a full-width block above all organic results regardless of whether the query actually signaled that intent, which is why it felt like video packs appeared "almost every search." Real google.com is far more selective about promoting this kind of carousel to a prominent position. Fixed by gating `inline_images`/`inline_videos` visibility on an actual keyword-intent match (`hasImageIntent`/`hasVideoIntent`); `top_stories` stays ungated since a news carousel is a stronger Google-native editorial signal and wasn't part of what was reported as over-shown. Users can still reach a query's videos/images via the dedicated tabs regardless of intent-match — this only affects whether they're force-injected into the default web results view.

While fixing the gate, found and fixed a related pre-existing bug it exposed: the keyword matching used `.includes()` (substring match), so `"artificial intelligence"` incorrectly matched the image keyword `"art"` (found inside "art-ificial") — harmless before since it only affected tie-break order, but would have caused a real false-positive image pack once used for visibility. Switched to whole-word matching (same safe pattern `utils/moderation.js` already uses for the same class of problem). Verified: `"cow"` → no packs shown; `"cow videos"`/`"cow pictures"` → correctly gated in; `"artificial intelligence"` → no false positive; `"digital art"` → still correctly matches. `npm run build` clean throughout.

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

## Just fixed (2026-08-25, third pass) — stricter moderation + blocked-quote screen bug

**Quote screen bug**: on the adult-query blocked screen, the inspirational quote (`quoteForAdult`) was picked with `useState(() => isAdult ? getRandomQuote() : null)` — a lazy initializer that **only runs once, at mount**. Since `SearchPage` stays mounted across different searches (react-router doesn't remount on a param-only URL change), the quote only came through correctly if the very first search since page-load happened to be flagged adult. Every adult query after a non-adult one on the same page instance rendered the blocked screen with a stale/`null` quote — blank quote text, no crash, just visibly broken. Fixed in `src/pages/SearchPage.jsx` by switching to `useMemo(() => isAdult ? getRandomQuote() : null, [isAdult, query])`, which recomputes synchronously on every query change — the quote now always appears instantly, no async involved either way.

**Stricter moderation**: `src/utils/moderation.js`'s `isAdultQuery()` had a real bypass loophole — the medical-context check ran *before* the adult-keyword check and unconditionally cleared the whole query if *any* word matched `MEDICAL_ALLOWLIST`, regardless of how explicit the rest of the query was (e.g. `"pornhub doctor"` or `"xnxx treatment"` previously passed as safe). Fixed by splitting the keyword list into two tiers:
- `EXPLICIT_KEYWORDS` — unambiguous adult terms/sites (porn, pornhub, xnxx, xvideos, xxx, hentai, onlyfans, and ~30 more, expanded from the original list) — **always** blocked, never eligible for the medical bypass.
- `AMBIGUOUS_KEYWORDS` — genuinely dual-use anatomical terms (breast, nude, naked, kissing, etc.) — still eligible for the medical/educational bypass, since these are the ones with real legitimate uses (`"breast cancer"`, `"kissing disease"`, `"sex education"` all still pass).

Verified with a standalone test covering the closed loophole, several legitimate medical/educational queries (still pass), and the existing `"Middlesex"`-style false-positive guard (still holds) — all as expected. Also re-verified end-to-end through the dev `/api/search` proxy (which reuses the same function server-side): the loophole query now returns 403, the legitimate medical query still returns 200. `npm run build` clean.

## Just fixed (2026-08-25, fourth pass) — AI Mode rendering regressions

Two real regressions in the AI text-rendering pipeline, both reported directly by the user with example output:

**`[object Object]` appearing instead of list items**: `NexaOverview.jsx`'s "ask a follow-up" flow (`handleSendMessage`) builds the seed chat message by mapping over `ai_overview` blocks and interpolating list items directly (`` `- ${i}` ``). When SerpAPI returns a list item as an object rather than a plain string (a shape the component's own *render* path already defended against via a local `formatText` helper), `${i}` silently stringifies it to the literal text `"[object Object]"` instead of throwing — so it wasn't caught by anything, it just produced garbage text that got sent into the AI chat. Fixed by extracting the existing object-normalization logic into a shared `toPlainText()` helper and applying it to `b.title`, `b.snippet`, and every `b.list` item in `handleSendMessage` (previously only the render path had this protection); `formatText` itself now delegates to the same helper instead of duplicating the logic.

**Code blocks rendering as broken placeholder text** (e.g. `_CODEBLOCK0_`): `utils/markdown.js` extracts fenced code blocks to a placeholder token (`__CODE_BLOCK_0__`) early, then restores the real HTML at the end. The underscore-italic rule (`/_([^_]+)_/g`, added in a later commit for `_text_` → `<em>`) runs *in between* those two steps and matches pieces of the placeholder itself — `__CODE_BLOCK_0__` contains `_CODE_` and `_0_`, both valid `_text_` matches — corrupting the token before the final exact-string restoration could find it. This is a genuine "it used to work" regression: code-block rendering broke the moment underscore-italic support was added, since nothing protected the placeholder from it. Fixed by switching both the code-block and (newly) inline-code placeholders to a token format (`@@NEXACODEBLOCK0@@` / `@@NEXAINLINECODE0@@`) that can't collide with any markdown syntax character used by the other regex passes, and by making inline code go through the same placeholder-then-restore pattern as code blocks — which also fixes the identical latent bug for any inline code snippet containing an underscore or asterisk (e.g. `` `num_1` `` or `` `my*ptr` ``), not just fenced blocks.

Verified: `npm run build` clean, plus a standalone test reproducing the user's exact biryani-recipe/Java-code transcript shape — no leftover placeholder text, both code blocks render as real `<pre>` blocks, and an inline code span containing an underscore renders correctly and untouched by the italic pass.

## Just fixed (2026-08-25, fifth pass) — AI markdown + SERP pack verification

Ran a full verification pass at the user's request: every markdown element the AI parser supports (headings 1–6, bold, italic `*`/`_`, strikethrough, links, ordered/unordered lists, blockquotes, hr, code blocks, inline code, nested combinations) tested against `parseMarkdown()` directly — all correct. Then tested pack/result selection against **real live SerpAPI responses** (not just code review) across a range of query intents: person ("Albert Einstein" → knowledge graph, related searches/questions, inline videos), weather, local ("coffee shops near me" → local_results + local_map), video-intent, currency conversion, general-topic (→ ai_overview, inline images/videos), sports (→ sports_results + knowledge_graph together), breaking-news (→ top_stories), shopping (`type=shopping` → shopping_results), news (`type=news` → news_results). This surfaced two real bugs, both fixed:

1. **Knowledge panel invisible on mobile/tablet.** `SearchPage.jsx` only ever rendered `<KnowledgePanel>` inside `<div className="hidden lg:block w-80 shrink-0">` — `display:none` below the 1024px breakpoint, with no other placement anywhere. The knowledge graph data was still being fetched (a real SerpAPI cost) but never shown to any visitor on a phone or portrait tablet. Fixed by adding a second `lg:hidden` inline placement of the same `<KnowledgePanel data={knowledgeGraph} />` near the top of the main results column, so mobile/tablet visitors now see it too (desktop keeps the sidebar).
2. **Knowledge panel's "Key facts" section never rendered for real data.** `KnowledgePanel.jsx` only read `data.facts`, but verified against a live "Albert Einstein" response, SerpAPI's actual knowledge_graph shape has no `facts` object at all — it exposes facts as dynamic top-level fields specific to the entity type (`born`, `died`, `spouse`, `children`, `education`, `height`, `parents` for a person; different fields for other entity types), each paired with a `..._links` array variant. This meant the facts table — arguably the most useful part of the panel — was dead code for every real query. Fixed with an `extractFacts()` helper that falls back to reading top-level fields when `data.facts` is absent, excluding known meta fields (title, description, header_images, source links, `people_also_search_for`, etc.) and the `_link`/`_links` variants. Also improved fact labels from raw snake_case (`spouse_links` → skipped; `born` → "Born") to Title Case with spaces. Verified against the real captured Einstein response: 7 facts correctly extracted (Born, Died, Spouse, Children, Education, Height, Parents), first 6 shown per the existing cap.

Everything else checked out correctly against live data: `top_stories`, `inline_images`, `inline_videos`, `local_results`/`local_map`, `answer_box` (weather + currency converter shapes), `sports_results`, `related_searches`, `related_questions`, `shopping_results`, `news_results`, and `ai_overview` all matched the field names `SearchPage.jsx` already expects — no other mismatches found. `npm run build` clean throughout.

## Just fixed (2026-08-25, sixth pass) — translation box missing + currency/translation swap bugs

**Translation box not appearing for queries like "necessary meaning in urdu"**: verified live against real SerpAPI responses — it genuinely never returns a real `answer_box` for translation-intent queries in this environment (tested "necessary meaning in urdu", "hello meaning in urdu", "translate hello to urdu", "good morning meaning in urdu" — all came back with `answer_box` entirely absent). The existing fallback (a "Portfolio Mock" in `SearchPage.jsx`) only fired for queries containing the literal substrings `"translate"` **and** `"urdu"`, so `"necessary meaning in urdu"` fell through it and showed nothing. On top of that, the mock's translated text was **hardcoded** to always show "ہیلو" (Urdu for "Hello") regardless of the actual query — correct only for the literal example it was written for.

Fixed properly:
- `detectTranslationIntent()` (new, in `SearchPage.jsx`) recognizes both `"translate <phrase> to/into/in <language>"` and `"<phrase> meaning in <language>"`, validated against a real, centralized language list (`TRANSLATION_LANGUAGES`, moved from being duplicated inside `TranslationBox.jsx` into `src/constants/index.js`) — no longer Urdu-only, and no false positives on unrelated "X in Y" queries (verified: `"best restaurants in london"` and `"coffee shops near me"` correctly don't match).
- The synthesized box now seeds `target.text` **empty** instead of a hardcoded guess; `TranslationBox.jsx` detects that empty-target signal on mount and fires a real Gemini translation immediately — verified end-to-end against the live API: `"necessary"` → `"ضروری"` (correct).

**Root cause of "swapping, changing langs... not working as it should"** (also explains "usd to pkr appearing but swap/change not working"): `answerBox` in `SearchPage.jsx` was a **plain object rebuilt fresh on every render**, real or synthesized. Both `TranslationBox.jsx` and `CurrencyConverterBox.jsx` sync their internal state from this prop via `useEffect(() => {...reset everything...}, [data])`. Since object identity, not content, drives that dependency check, **any unrelated re-render of `SearchPage`** (e.g. the `aiOverviewData` effect firing after the page already painted) silently reset the box back to its original seed — wiping out whatever swap, language change, or amount edit the user had just made. This is a much better explanation for a vague, intermittent "doesn't work as it should" than a one-off logic bug, since it wouldn't reproduce consistently. Fixed by wrapping `answerBox`'s computation in `useMemo(() => {...}, [data, type, query])`, so its reference is now stable across incidental re-renders and only actually changes when the search itself changes — the same pattern already used to fix the `quoteForAdult` bug earlier in this session.

**Also fixed, a genuine independent bug**: `CurrencyConverterBox.jsx`'s `handleSwap` swapped the currency *labels* but never updated `fromAmount` — so swapping "100 USD = 27850 PKR" produced "100 PKR = ⟨nonsense recompute⟩" instead of "27850 PKR = 100 USD". Fixed to carry the previous `toAmount` over into the new `fromAmount`, matching standard swap-button UX (mirrors Google Translate's own swap behavior, which `TranslationBox.jsx`'s swap already did correctly — only `CurrencyConverterBox` had this gap).

Verified: `npm run build` clean; `detectTranslationIntent()` tested against 8 cases (realistic matches + false-positive guards) — all correct; the real `/api/chat` Gemini call for the new auto-translate path tested directly — returns a correct translation, not a placeholder.

## Known bugs (unresolved)

1. **Translation box re-search bug — likely fixed 2026-08-25, pending user confirmation.** Originally documented by the developer directly in `prompt.md` at repo root: editing the translation input and pressing enter was expected to update *only* the translation pane, but instead the translation stayed stale ("old as hello in urdu") while other page content seemed to shift. The `answerBox` reference-instability bug fixed in this session's sixth pass (see above) is a strong match for "translation stays stale" — `TranslationBox`'s sync-effect was resetting the user's in-progress edit back to the original seed on any incidental re-render, which would look exactly like "my new input didn't take, it's still showing the old translation." Not verified with actual interactive browser testing (no browser automation available in this session) — if this still reproduces, especially the "web results changing" part, there is likely a second, distinct cause still to find (possibly something making the Enter keypress bubble to an ancestor form/handler) — re-test this specific repro from `prompt.md` first before assuming it's still broken.

## Known gaps / incomplete features

- **AI Overview pagination is unimplemented.** `SearchPage.jsx` has explicit logic acknowledging that when SerpAPI returns only a `page_token` (no `text_blocks`) for `ai_overview`, that token should be used to fetch the rest — the code comment says "Handle token logic later." Currently, such overviews simply don't render further content.
- **Content moderation (`isAdultQuery`) is still a soft keyword filter**, not real moderation — it's now enforced both client- and server-side (see above), so it's no longer trivially bypassed by calling `/api/search` directly, but it's still just keyword matching, not a real safety/compliance boundary.
- **Rate limiting is best-effort, in-memory, per-warm-instance** — there's no database/Redis in this project, so it doesn't hold under real multi-instance scale-out on Vercel. It's a meaningful improvement over having nothing, not a substitute for a real rate-limiting service if this app ever gets real traffic.
- ~~Portfolio-only hardcoded demo hack~~ — **replaced 2026-08-25** with `detectTranslationIntent()`, a general translation-intent detector that synthesizes a real Gemini-translated `answer_box` for any recognized phrasing/language, not just the literal "translate...urdu" case. See ARCHITECTURE.md.
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
