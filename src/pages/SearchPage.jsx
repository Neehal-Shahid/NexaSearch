import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/search/SearchBar';
import SearchTabs from '../components/search/SearchTabs';
import WebResultList from '../components/results/WebResultList';
import ImageResultGrid from '../components/results/ImageResultGrid';
import NewsResultList from '../components/results/NewsResultList';
import VideoResultGrid from '../components/results/VideoResultGrid';
import KnowledgePanel from '../components/results/KnowledgePanel';
import RelatedSearches from '../components/results/RelatedSearches';
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

  // Determine which results to show based on search type
  const getResults = () => {
    if (!data) return null;

    switch (type) {
      case 'images':
        return data.images_results;
      case 'news':
        return data.news_results;
      case 'videos':
        return data.video_results;
      default:
        return data.organic_results;
    }
  };

  const results = getResults();
  const hasNext = data?.serpapi_pagination?.next != null;
  const knowledgeGraph = type === 'web' ? data?.knowledge_graph : null;
  const relatedSearches = type === 'web' ? data?.related_searches : null;
  const searchInfo = data?.search_information;

  // No query provided
  if (!query) {
    return (
      <main className="flex-1">
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
    <main className="flex-1">
      <PageContainer className="py-4">
        {/* Search bar */}
        <div className="max-w-2xl">
          <SearchBar variant="compact" />
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <SearchTabs />
        </div>

        {/* Content area */}
        <div className="mt-6" aria-live="polite">
          {/* Search metadata */}
          {searchInfo?.total_results && !loading && (
            <p className="text-xs text-text-muted mb-4">
              About {Number(searchInfo.total_results).toLocaleString()} results
              {searchInfo.time_taken_displayed && ` (${searchInfo.time_taken_displayed} seconds)`}
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
                <div className={type === 'web' && knowledgeGraph ? 'flex gap-8' : ''}>
                  {/* Main results column */}
                  <div className={type === 'web' && knowledgeGraph ? 'flex-1 min-w-0' : 'w-full'}>
                    {type === 'web' && <WebResultList results={results} />}
                    {type === 'images' && <ImageResultGrid results={results} />}
                    {type === 'news' && <NewsResultList results={results} />}
                    {type === 'videos' && <VideoResultGrid results={results} />}

                    {/* Related searches (web only) */}
                    {relatedSearches && <RelatedSearches searches={relatedSearches} />}

                    {/* Pagination */}
                    <Pagination hasNext={hasNext} />
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
