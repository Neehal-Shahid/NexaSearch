import { useEffect, useState } from 'react';
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

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'web';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, loading, error, retry } = useSearch(query, type, page);
  const { addToHistory } = useSearchHistory();
  const [aiOverviewData, setAiOverviewData] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Record search in history when results arrive
  useEffect(() => {
    if (data && query) {
      addToHistory(query, type);
    }
  }, [data, query, type, addToHistory]);

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
        // Only automatically fetch if we haven't already for this token
        // In a real production scenario with tight quotas, we might want to attach this to a user click instead.
        // For now, we will wait for user interaction to fetch it, to optimize quota.
        // We'll handle this in the NexaOverview component if needed, or just skip it if there's no text blocks.
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
  let answerBox = type === 'web' ? data?.answer_box : null;

  // Portfolio Mock: If Google doesn't return a direct answer box for a translation query, 
  // we can inject a mock one to showcase the translation UI component for the portfolio.
  if (!answerBox && type === 'web' && query.toLowerCase().includes('translate') && query.toLowerCase().includes('urdu')) {
    answerBox = {
      type: "translation_result",
      source: { language: "English", text: query.replace(/translate | to urdu| in urdu/gi, '').trim() || "Hello" },
      target: { language: "Urdu", text: "ہیلو" }
    };
  }
  const peopleAlsoAsk = type === 'web' ? data?.related_questions : null;
  const searchInfo = data?.search_information;
  const localResults = type === 'web' ? data?.local_results?.places || data?.local_results : null;
  const sportsResults = type === 'web' ? data?.sports_results : null;

  // Intent Analysis Algorithm to dynamically order search packs
  const getPackOrder = () => {
    const q = query.toLowerCase();
    
    const videoKeywords = ['video', 'videos', 'movie', 'watch', 'trailer', 'youtube', 'clip', 'stream', 'mp4'];
    const imageKeywords = ['pic', 'pics', 'picture', 'pictures', 'image', 'images', 'photo', 'photos', 'wallpaper', 'art', 'drawing'];
    const newsKeywords = ['news', 'latest', 'update', 'breaking', 'today', 'recent'];
    
    // Assign +10 points if the query matches the specific intent
    const videoScore = videoKeywords.some(kw => q.includes(kw)) ? 10 : 0;
    const imageScore = imageKeywords.some(kw => q.includes(kw)) ? 10 : 0;
    const newsScore = newsKeywords.some(kw => q.includes(kw)) ? 10 : 0;
    
    // Tie-breaker default priorities (Fallback: News > Images > Videos)
    const packs = [
      { id: 'top_stories', score: newsScore + 3 },
      { id: 'inline_images', score: imageScore + 2 },
      { id: 'inline_videos', score: videoScore + 1 }
    ];
    
    // Sort highest score first
    return packs.sort((a, b) => b.score - a.score).map(p => p.id);
  };
  
  const packOrder = type === 'web' ? getPackOrder() : [];

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
                  <AiMode data={data} query={query} />
                </div>
              ) : (
                    <div className={type === 'web' && knowledgeGraph ? 'flex gap-10' : ''}>
                      {/* Main results column */}
                      <div className={type === 'web' && knowledgeGraph ? 'flex-1 min-w-0 max-w-3xl' : 'w-full max-w-5xl'}>
                        
                        {/* Nexa Overview or Answer Box */}
                        {type === 'web' && (
                          <>
                            {answerBox && <AnswerBox data={answerBox} />}
                            {aiOverviewData && <NexaOverview data={aiOverviewData} searchContext={data?.organic_results?.slice(0, 5).map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n')} query={query} />}
                          </>
                        )}

                        {type === 'web' && (localResults || data?.local_map) && (
                          <LocalResults results={localResults || []} map={data?.local_map} />
                        )}

                        {type === 'web' && sportsResults && (
                          <SportsBox data={sportsResults} />
                        )}

                        {/* Dynamic Intent-Based Inline Packs */}
                        {type === 'web' && packOrder.map(packId => {
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
                          
                          if (packId === 'inline_images' && data?.inline_images && data.inline_images.length > 0) {
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

                          if (packId === 'inline_videos' && data?.inline_videos && data.inline_videos.length > 0) {
                            return (
                              <div key={packId} className="mb-8">
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Videos
                                </h2>
                                <VideoResultGrid results={data.inline_videos.slice(0, 3)} variant="inline" />
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
