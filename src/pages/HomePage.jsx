import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import SearchBar from '../components/search/SearchBar';
import TrendingSearches from '../components/search/TrendingSearches';
import PageContainer from '../components/layout/PageContainer';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { TRENDING_SEARCHES } from '../constants';

export default function HomePage() {
  const navigate = useNavigate();
  const { getRecentSearches } = useSearchHistory();
  const recentSearches = getRecentSearches(5);

  const handleRecentClick = (query, type) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=${type}&page=1`);
  };

  return (
    <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <PageContainer className="w-full max-w-2xl py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <Logo size="lg" className="justify-center mb-4" />
          <p className="text-text-secondary text-base mt-2">
            Search the web. Discover more.
          </p>
        </div>

        {/* Search bar */}
        <SearchBar variant="hero" autoFocus />

        {/* Trending searches */}
        <TrendingSearches searches={TRENDING_SEARCHES} />

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border-subtle">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Recent
            </p>
            <div className="space-y-1">
              {recentSearches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRecentClick(item.query, item.type)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary rounded-lg hover:bg-surface-secondary hover:text-text-primary transition-colors text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="truncate">{item.query}</span>
                  {item.type !== 'web' && (
                    <span className="text-[11px] text-text-muted capitalize shrink-0">{item.type}</span>
                  )}
                  <svg className="w-3.5 h-3.5 ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
