import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import AnswerBox from '../components/results/AnswerBox';
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
  const answerBox = type === 'web' ? data?.answer_box : null;
  const peopleAlsoAsk = type === 'web' ? data?.related_questions : null;
  const searchInfo = data?.search_information;
  const localResults = type === 'web' ? data?.local_results?.places || data?.local_results : null;

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
          {searchInfo?.total_results && !loading && (
            <p className="text-xs font-medium text-text-muted mb-6 tracking-wide">
              ABOUT {Number(searchInfo.total_results).toLocaleString()} RESULTS
              {searchInfo.time_taken_displayed && ` (${searchInfo.time_taken_displayed}S)`}
            </p>
          )}

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
              ) : (
                <div className={type === 'web' && knowledgeGraph ? 'flex gap-10' : ''}>
                  {/* Main results column */}
                  <div className={type === 'web' && knowledgeGraph ? 'flex-1 min-w-0 max-w-3xl' : 'w-full max-w-5xl'}>
                    
                    {/* Nexa Overview or Answer Box */}
                    {type === 'web' && (
                      <>
                        {aiOverviewData ? (
                          <NexaOverview data={aiOverviewData} />
                        ) : answerBox ? (
                          <AnswerBox data={answerBox} />
                        ) : null}
                      </>
                    )}

                    {type === 'web' && localResults && (
                      <LocalResults results={localResults} />
                    )}

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
                    {type !== 'news' && (
                      <div className="mt-12">
                        <Pagination hasNext={hasNext} />
                      </div>
                    )}
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
