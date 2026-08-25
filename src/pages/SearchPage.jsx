import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/search/SearchBar';
import SearchTabs from '../components/search/SearchTabs';
import WebResultList from '../components/results/WebResultList';
import ImageResultGrid from '../components/results/ImageResultGrid';
import NewsResultList from '../components/results/NewsResultList';
import VideoResultGrid from '../components/results/VideoResultGrid';
import ShoppingResultGrid from '../components/results/ShoppingResultGrid';
import KnowledgePanel from '../components/results/KnowledgePanel';
import RelatedSearches from '../components/results/RelatedSearches';
import LocalResults from '../components/results/LocalResults';
import NexaOverview from '../components/results/NexaOverview';
import AiMode from '../components/results/AiMode';
import AnswerBox from '../components/results/AnswerBox';
import SportsBox from '../components/results/SportsBox';
import PeopleAlsoAsk from '../components/results/PeopleAlsoAsk';
import Pagination from '../components/ui/Pagination';
import LoadingSkeleton from '../components/feedback/LoadingSkeleton';
import EmptyState from '../components/feedback/EmptyState';
import ErrorState from '../components/feedback/ErrorState';
import { useSearch } from '../hooks/useSearch';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { isAdultQuery, getRandomQuote } from '../utils/moderation';
import { FEATURE_FLAGS, TRANSLATION_LANGUAGES } from '../constants';

// Recognizes "translate <phrase> to/into/in <language>" and
// "<phrase> meaning in <language>" — the two phrasings that reliably signal
// translation intent without false-positiving on unrelated "X in Y" queries
// (e.g. "best restaurants in london" doesn't match either pattern).
function detectTranslationIntent(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const match =
    trimmed.match(/^translate\s+(.+?)\s+(?:to|into|in)\s+([a-zA-Z]+)$/i) ||
    trimmed.match(/^(.+?)\s+meaning\s+in\s+([a-zA-Z]+)$/i);
  if (!match) return null;

  const [, rawPhrase, rawLanguage] = match;
  const phrase = rawPhrase.trim();
  const language = TRANSLATION_LANGUAGES.find(
    (lang) => lang.toLowerCase() === rawLanguage.trim().toLowerCase()
  );
  if (!phrase || !language) return null;

  return { phrase, language };
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'web';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const isAdult = isAdultQuery(query);
  const { data, loading, error, retry } = useSearch(isAdult ? '' : query, type, page);
  const { addToHistory } = useSearchHistory();
  const [aiOverviewData, setAiOverviewData] = useState(null);
  // Recompute per query, not just once at mount — SearchPage stays mounted
  // across searches (react-router doesn't remount on a param-only URL
  // change), so a mount-time-only useState() left this stale/blank for
  // every adult query after the first one on the page.
  const quoteForAdult = useMemo(() => (isAdult ? getRandomQuote() : null), [isAdult, query]);

  // Record search in history when results arrive
  useEffect(() => {
    if (data && query && !isAdult) {
      addToHistory(query, type);
    }
  }, [data, query, type, addToHistory, isAdult]);

  // Update document title
  useEffect(() => {
    if (query) {
      document.title = `${query} — Nexa Search`;
    }
    return () => {
      document.title = 'Nexa — Search & Discover';
    };
  }, [query]);

  // Handle AI Overview page_token resolution
  useEffect(() => {
    if (type === 'web' && data?.ai_overview) {
      if (data.ai_overview.text_blocks) {
        setAiOverviewData(data.ai_overview);
      } else if (data.ai_overview.page_token) {
        // Handle token logic later
      }
    } else {
      setAiOverviewData(null);
    }
  }, [data, type]);

  // Determine which results to show based on search type
  const getResults = () => {
    if (!data) return null;

    switch (type) {
      case 'images':
        return data.images_results;
      case 'news': {
        const newsResults = data.news_results;
        if (!newsResults) return null;
        const flat = [];
        for (const item of newsResults) {
          if (item.stories) {
            flat.push(...item.stories);
          } else {
            flat.push(item);
          }
        }
        return flat.length > 0 ? flat : newsResults;
      }
      case 'videos':
        return data.video_results || data.inline_videos;
      case 'shopping':
        return data.shopping_results;
      default:
        return data.organic_results;
    }
  };

  const results = getResults();
  const hasNext = data?.serpapi_pagination?.next != null;
  const knowledgeGraph = type === 'web' ? data?.knowledge_graph : null;
  const relatedSearches = type === 'web' ? data?.related_searches : null;

  // SerpAPI rarely/never returns a real translation answer_box for
  // translation-intent queries ("X meaning in Y", "translate X to Y") even
  // though Google's own UI shows one — verified empirically, not just
  // assumed. When that happens, synthesize one so the feature still works.
  //
  // This MUST be memoized: it used to be a plain `let` recomputed fresh on
  // every render (a brand-new object either way, real or synthesized). Since
  // TranslationBox/CurrencyConverterBox both sync their internal state from
  // this prop via a `useEffect(() => {...}, [data])`, a new reference on any
  // unrelated SearchPage re-render (e.g. the aiOverviewData effect firing)
  // silently reset whatever swap/language-change/amount-edit the user had
  // just made back to the original seed — which is what "swapping/changing
  // langs doesn't work" actually was.
  const answerBox = useMemo(() => {
    const realAnswerBox = type === 'web' ? data?.answer_box : null;
    if (realAnswerBox) return realAnswerBox;
    if (type !== 'web') return null;

    const intent = detectTranslationIntent(query);
    if (!intent) return null;

    return {
      type: 'translation_result',
      source: { language: 'English', text: intent.phrase },
      // Empty target text signals TranslationBox to fetch a real translation
      // on mount instead of showing placeholder/wrong text.
      target: { language: intent.language, text: '' },
    };
  }, [data, type, query]);

  const peopleAlsoAsk = type === 'web' ? data?.related_questions : null;
  const searchInfo = data?.search_information;
  const localResults = type === 'web' ? data?.local_results?.places || data?.local_results : null;
  const sportsResults = type === 'web' ? data?.sports_results : null;

  // Intent Analysis Algorithm to dynamically order AND gate search packs.
  //
  // SerpAPI returns inline_images/inline_videos carousels for a huge range
  // of queries (verified live: a plain "cow" search returns a real
  // inline_videos array even though the query has no video-related words at
  // all) — far more often than real google.com actually promotes them to a
  // prominent block above the organic results. Scoring used to only affect
  // *order*, not *visibility*, so any available pack got shown regardless of
  // whether the query signaled that intent. Images/videos are now gated on a
  // genuine keyword match; top_stories stays ungated since a news carousel
  // is a stronger, Google-native editorial signal rather than exploratory
  // filler, and wasn't part of what was reported as over-shown.
  const getPackOrder = () => {
    // Whole-word matching, not substring — .includes() would match "art"
    // inside "artificial" (as in "artificial intelligence"), incorrectly
    // signaling image intent. Now that scores gate visibility rather than
    // just ordering, that false positive would actually show a pack for
    // queries that clearly don't call for one.
    const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    const videoKeywords = ['video', 'videos', 'movie', 'watch', 'trailer', 'youtube', 'clip', 'stream', 'mp4'];
    const imageKeywords = ['pic', 'pics', 'picture', 'pictures', 'image', 'images', 'photo', 'photos', 'wallpaper', 'art', 'drawing'];
    const newsKeywords = ['news', 'latest', 'update', 'breaking', 'today', 'recent'];

    // Assign +10 points if the query matches the specific intent
    const videoScore = words.some(w => videoKeywords.includes(w)) ? 10 : 0;
    const imageScore = words.some(w => imageKeywords.includes(w)) ? 10 : 0;
    const newsScore = words.some(w => newsKeywords.includes(w)) ? 10 : 0;

    // Tie-breaker default priorities (Fallback: News > Images > Videos)
    const packs = [
      { id: 'top_stories', score: newsScore + 3 },
      { id: 'inline_images', score: imageScore + 2 },
      { id: 'inline_videos', score: videoScore + 1 }
    ];

    return {
      order: packs.sort((a, b) => b.score - a.score).map(p => p.id),
      hasImageIntent: imageScore > 0,
      hasVideoIntent: videoScore > 0,
    };
  };

  const { order: packOrder, hasImageIntent, hasVideoIntent } =
    type === 'web' ? getPackOrder() : { order: [], hasImageIntent: false, hasVideoIntent: false };

  // No query provided
  if (!query) {
    return (
      <main className="flex-1 bg-background">
        <PageContainer className="py-8">
          <SearchBar variant="compact" autoFocus />
          <EmptyState
            title="Enter a search query"
            description="Type something in the search bar above to get started."
          />
        </PageContainer>
      </main>
    );
  }

  if (isAdult) {
    return (
      <main className="flex-1 bg-background min-h-[80vh] flex flex-col relative overflow-hidden">
        {/* Subtle animated background gradient for beautiful vibe */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-emerald-500/5 animate-gradient-x opacity-60"></div>
        
        <PageContainer className="py-8 relative z-10">
          <SearchBar variant="compact" />
          
          <div className="flex flex-col items-center justify-center mt-24 max-w-2xl mx-auto text-center px-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-8 shadow-sm">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6 leading-tight font-serif italic">
              "{quoteForAdult?.text}"
            </h2>
            
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-widest bg-surface-secondary px-4 py-2 rounded-full border border-border-subtle inline-block">
              — {quoteForAdult?.source} —
            </p>
            
            <p className="mt-12 text-sm text-text-muted">
              Nexa is committed to providing a clean, safe, and positive search environment for everyone.
            </p>
          </div>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background">
      <PageContainer className="py-6">
        {/* Search bar */}
        <div className="max-w-2xl">
          <SearchBar variant="compact" />
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-border-subtle pb-2">
          <SearchTabs />
        </div>

        {/* Content area */}
        <div className="mt-8" aria-live="polite">
          {/* Search metadata */}
          {searchInfo?.total_results ? (
            !loading && (
              <p className="text-xs font-medium text-text-muted mb-6 tracking-wide">
                ABOUT {Number(searchInfo.total_results).toLocaleString()} RESULTS
                {searchInfo.time_taken_displayed && ` (${searchInfo.time_taken_displayed}S)`}
              </p>
            )
          ) : null}

          {/* Loading state */}
          {loading && <LoadingSkeleton type={type} />}

          {/* Error state */}
          {!loading && error && <ErrorState message={error} onRetry={retry} />}

          {/* Results */}
          {!loading && !error && results && (
            <>
              {results.length === 0 ? (
                <EmptyState
                  title={`No results found for "${query}"`}
                  description="Try different keywords, check your spelling, or broaden your search."
                />
              ) : type === 'ai' ? (
                <div className="w-full">
                  {localStorage.getItem(FEATURE_FLAGS.DISABLE_AI) === 'true' ? (
                    <EmptyState
                      title="AI Features Disabled"
                      description="The administrator has temporarily disabled all AI features on Nexa."
                    />
                  ) : (
                    <AiMode data={data} query={query} />
                  )}
                </div>
              ) : (
                    <div className={type === 'web' && knowledgeGraph ? 'flex gap-10' : ''}>
                      {/* Main results column */}
                      <div className={type === 'web' && knowledgeGraph ? 'flex-1 min-w-0 max-w-3xl' : 'w-full max-w-5xl'}>
                        
                        {/* Nexa Overview or Answer Box */}
                        {type === 'web' && (
                          <>
                            {answerBox && <AnswerBox data={answerBox} />}
                            {localStorage.getItem(FEATURE_FLAGS.DISABLE_AI) !== 'true' && aiOverviewData && <NexaOverview data={aiOverviewData} searchContext={data?.organic_results?.slice(0, 5).map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n')} query={query} />}
                          </>
                        )}

                        {/* Knowledge panel (mobile/tablet) — the sidebar placement below is
                            desktop-only (hidden below the lg breakpoint), so without this the
                            panel never rendered anywhere on phones/tablets even though the data
                            was already fetched. */}
                        {type === 'web' && knowledgeGraph && (
                          <div className="lg:hidden mb-8">
                            <KnowledgePanel data={knowledgeGraph} />
                          </div>
                        )}

                        {type === 'web' && (localResults || data?.local_map) && (
                          <LocalResults results={localResults || []} map={data?.local_map} />
                        )}

                        {type === 'web' && sportsResults && (
                          <SportsBox data={sportsResults} />
                        )}

                        {/* Dynamic Intent-Based Inline Packs */}
                        {type === 'web' && localStorage.getItem(FEATURE_FLAGS.DISABLE_MEDIA_PACKS) !== 'true' && packOrder.map(packId => {
                          if (packId === 'top_stories' && data?.top_stories && data.top_stories.length > 0) {
                            return (
                              <div key={packId} className="mb-8">
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                  </svg>
                                  Top Stories
                                </h2>
                                <NewsResultList results={data.top_stories.slice(0, 3)} variant="inline" />
                                <div className="mt-4">
                                  <Link 
                                    to={`/search?q=${encodeURIComponent(query)}&type=news&page=1`} 
                                    className="inline-flex px-4 py-2 bg-surface border border-border-subtle rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors"
                                  >
                                    Investigate deeper →
                                  </Link>
                                </div>
                              </div>
                            );
                          }
                          
                          if (packId === 'inline_images' && hasImageIntent && data?.inline_images && data.inline_images.length > 0) {
                            return (
                              <div key={packId} className="mb-8">
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Images
                                </h2>
                                <ImageResultGrid results={data.inline_images.slice(0, 4)} variant="inline" />
                                <div className="mt-4">
                                  <Link 
                                    to={`/search?q=${encodeURIComponent(query)}&type=images&page=1`} 
                                    className="inline-flex px-4 py-2 bg-surface border border-border-subtle rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors"
                                  >
                                    View all images →
                                  </Link>
                                </div>
                              </div>
                            );
                          }

                          if (packId === 'inline_videos' && hasVideoIntent && data?.inline_videos && data.inline_videos.length > 0) {
                            return (
                              <div key={packId} className="mb-8">
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Videos
                                </h2>
                                <VideoResultGrid results={data.inline_videos.slice(0, 4)} variant="inline" />
                                <div className="mt-4">
                                  <Link 
                                    to={`/search?q=${encodeURIComponent(query)}&type=videos&page=1`} 
                                    className="inline-flex px-4 py-2 bg-surface border border-border-subtle rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors"
                                  >
                                    View all videos →
                                  </Link>
                                </div>
                              </div>
                            );
                          }
                          
                          return null;
                        })}

                        {type === 'web' && <WebResultList results={results} />}
                        {type === 'images' && <ImageResultGrid results={results} />}
                        {type === 'news' && <NewsResultList results={results} />}
                        {type === 'videos' && <VideoResultGrid results={results} />}
                        {type === 'shopping' && <ShoppingResultGrid results={results} />}

                        {/* People Also Ask (web only) */}
                        {type === 'web' && peopleAlsoAsk && (
                          <PeopleAlsoAsk questions={peopleAlsoAsk} />
                        )}

                        {/* Related searches (web only) */}
                        {relatedSearches && <RelatedSearches searches={relatedSearches} />}

                        {/* Pagination */}
                        <div className="mt-12">
                          <Pagination hasNext={hasNext} />
                        </div>
                      </div>

                      {/* Knowledge panel sidebar (desktop, web results only) */}
                      {type === 'web' && knowledgeGraph && (
                        <div className="hidden lg:block w-80 shrink-0">
                          <KnowledgePanel data={knowledgeGraph} />
                        </div>
                      )}
                    </div>
                  )}
            </>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
