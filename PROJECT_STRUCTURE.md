# PROJECT_STRUCTURE.md — Nexa Search

Full map of the repository. Excludes `node_modules/`, `dist/` (build output), `.git/`.

```
Nexa/
├── api/                          # Vercel serverless functions (production backend)
│   ├── search.js                 # GET proxy → SerpAPI, dual-key rotation, geolocation, 5min cache headers
│   ├── chat.js                   # POST proxy → Gemini generateContent, model fallback chain
│   └── admin.js                  # GET → aggregated SerpAPI + Gemini account/usage stats (NO AUTH)
│
├── src/
│   ├── main.jsx                  # React root render (StrictMode + App)
│   ├── App.jsx                   # Router setup, route table, lazy-loaded pages, global providers
│   ├── index.css                 # Tailwind directives + custom keyframes/utilities (shimmer, gradients,
│   │                              #   image-masonry columns, skeleton, line-clamp, skip-link, scrollbars)
│   │
│   ├── api/
│   │   └── searchClient.js       # Client fetch wrapper for /api/search: in-memory 50-item cache,
│   │                              #   reads nexa_primary_key from localStorage to prefer backup SerpAPI key
│   │
│   ├── context/
│   │   ├── SavedResultsContext.jsx    # Bookmarks: save/remove/isSaved/clearAll, persisted to localStorage
│   │   │                              #   (key: nexa_saved_results)
│   │   └── SearchHistoryContext.jsx   # Search history: add/remove/clear (all or by timeframe: 15m/1h/24h/7d),
│   │                                  #   getRecentSearches; persisted (key: nexa_search_history, capped 50)
│   │
│   ├── hooks/
│   │   ├── useSearch.js          # Fetches search results for (query, type, page); AbortController-based
│   │   │                          #   cancellation on param change/unmount; exposes { data, loading, error, retry }
│   │   └── useDebounce.js        # Generic value-debounce hook
│   │
│   ├── constants/
│   │   └── index.js              # SEARCH_TYPES, SEARCH_TABS, TRENDING_SEARCHES, storage keys,
│   │                              #   HISTORY_MAX_ITEMS, RESULTS_PER_PAGE
│   │
│   ├── utils/
│   │   ├── formatters.js         # extractDomain, formatDate, formatHistoryDate, truncateText, formatDuration
│   │   ├── localStorage.js       # getStoredData/setStoredData/removeStoredData — try/catch-safe JSON wrappers
│   │   ├── markdown.js           # parseMarkdown(text) — regex-based markdown→HTML (used by AiMode.jsx)
│   │   └── moderation.js         # isAdultQuery() keyword+phrase matcher, MEDICAL_ALLOWLIST bypass list,
│   │                              #   INSPIRATIONAL_QUOTES + getRandomQuote() (shown instead of blocked search)
│   │
│   ├── pages/                    # One file per route (see ARCHITECTURE.md for the route table)
│   │   ├── HomePage.jsx          # "/" — hero, SearchBar, ExploreSection
│   │   ├── SearchPage.jsx        # "/search" — core results page; all 6 search types; largest/most complex page
│   │   ├── SavedPage.jsx         # "/saved" — bookmarked results, filterable by type
│   │   ├── HistoryPage.jsx       # "/history" — search history grouped by date, clear-by-timeframe
│   │   ├── AboutPage.jsx         # "/about" — static: features, tech stack, disclaimer
│   │   ├── PrivacyPage.jsx       # "/privacy" — static privacy policy text
│   │   ├── TermsPage.jsx         # "/terms" — static terms of service text
│   │   └── AdminPage.jsx         # "/admin" — API usage dashboard + local feature-flag toggles (NO AUTH)
│   │
│   └── components/
│       ├── layout/
│       │   ├── Header.jsx        # Sticky top nav, desktop links, mobile menu trigger
│       │   ├── MobileMenu.jsx    # Slide-in drawer nav (Escape + body-scroll-lock handled)
│       │   ├── Footer.jsx        # Static footer, nav columns, SerpAPI attribution
│       │   └── PageContainer.jsx # Max-width/padding wrapper
│       │
│       ├── search/
│       │   ├── SearchBar.jsx     # Main search input (hero/compact variants), history autocomplete, "/" shortcut
│       │   ├── SearchTabs.jsx    # Result-type tab bar; hides "AI" tab if admin_disable_ai flag is set
│       │   ├── CommandPalette.jsx# Cmd/Ctrl+K launcher: recent + trending + nav shortcuts
│       │   └── TrendingSearches.jsx # Static chip list of trending queries
│       │
│       ├── results/              # Largest folder — renders SerpAPI-shaped data
│       │   ├── NexaOverview.jsx      # Inline AI-overview card shown above web results (own mini markdown parser)
│       │   ├── AiMode.jsx            # Full AI chat tab/page — talks to /api/chat, renders via utils/markdown.js
│       │   ├── AnswerBox.jsx         # Dispatcher: routes answer_box data to Weather/Currency/Translation/generic
│       │   ├── WeatherBox.jsx        # Weather answer widget
│       │   ├── CurrencyConverterBox.jsx # Live currency converter (calls Gemini for rates)
│       │   ├── TranslationBox.jsx    # Live two-pane translator (calls Gemini)
│       │   ├── SportsBox.jsx         # Sports scoreboard widget
│       │   ├── KnowledgePanel.jsx    # Wikipedia-style knowledge graph side panel
│       │   ├── PeopleAlsoAsk.jsx     # Expandable PAA accordion
│       │   ├── RelatedSearches.jsx   # Related-query chip list
│       │   ├── LocalResults.jsx      # Local/map pack results
│       │   ├── WebResultList.jsx / WebResultItem.jsx     # Organic web results list/row
│       │   ├── NewsResultList.jsx / NewsResultCard.jsx   # News results (default + inline-pack variants)
│       │   ├── VideoResultGrid.jsx / VideoResultCard.jsx # Video results grid
│       │   ├── ImageResultGrid.jsx / ImageResultCard.jsx / ImagePreviewModal.jsx # Image masonry + lightbox
│       │   └── ShoppingResultGrid.jsx # Shopping product cards
│       │
│       ├── home/
│       │   └── ExploreSection.jsx    # Homepage topic-shuffle discovery grid (client-side random pick)
│       │
│       ├── feedback/
│       │   ├── EmptyState.jsx    # Generic "nothing here" state
│       │   ├── ErrorState.jsx    # Generic error state with retry
│       │   └── LoadingSkeleton.jsx # Shimmer skeletons per result type
│       │
│       └── ui/
│           ├── SaveButton.jsx    # Bookmark toggle, consumes SavedResultsContext
│           ├── Pagination.jsx    # URL-param-driven prev/next
│           ├── Toast.jsx         # Portal-based toast notification
│           ├── ConfirmModal.jsx  # Generic confirm/cancel dialog (danger/default styles)
│           ├── CustomSelect.jsx  # Searchable dropdown (used by Currency/Translation boxes)
│           ├── Logo.jsx          # Nexa wordmark/SVG mark, links to "/"
│           ├── SignatureVisual.jsx # Decorative background pattern, no logic
│           └── ErrorBoundary.jsx # Class-based React error boundary (added 2026-08-25); wraps routed
│                                  #   page content in App.jsx, resets on navigation — see ARCHITECTURE.md
│
├── public/                       # Static assets served as-is (favicon.svg, icons.svg)
├── dist/                         # Build output (generated, not source)
│
├── index.html                    # Vite entry HTML
├── vite.config.js                # Vite config + custom dev middleware that RE-IMPLEMENTS /api/search and
│                                  #   /api/admin for local dev, and proxies /api/chat to Gemini directly
├── vercel.json                   # SPA rewrite: all non-/api paths → index.html
├── tailwind.config.js            # Custom theme: teal accent (#003747), near-black/white neutrals
├── postcss.config.js
├── .oxlintrc.json                # oxlint (Rust-based linter) config
├── package.json                  # deps: react, react-dom, react-router-dom; devDeps: vite, tailwind, postcss
├── .env                          # SERPAPI_KEY, SERPAPI_KEY_2, GEMINI_API_KEY (gitignored, not committed)
│
├── README.md                     # Default Vite/React template boilerplate readme
├── nexa_case_study.md            # Developer's own product pitch/case-study writeup
├── prompt.md                     # Developer's own bug report re: translation-box behavior (unresolved — see
│                                  #   PROJECT_STATUS.md)
└── list_models.mjs, scratch_test.mjs, test_currency.mjs, test_gemini.mjs,
    test_logo.html, test_serp.cjs # Ad-hoc dev/debug scripts — not part of the build, not imported by src/
```

## File count snapshot

- `src/pages/`: 8 files
- `src/components/`: ~38 files across 6 subfolders (`results/` is by far the largest, ~24 files)
- `api/`: 3 serverless functions
- `src/context/`, `src/hooks/`, `src/utils/`, `src/constants/`: small, focused single-purpose files
- Total `src/` line count: ~4,350 lines (per `wc -l` at time of writing)
