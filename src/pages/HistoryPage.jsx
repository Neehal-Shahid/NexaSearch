import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/feedback/EmptyState';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { formatHistoryDate } from '../utils/formatters';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, removeFromHistory, clearHistory, clearHistoryByTimeframe } = useSearchHistory();

  const handleSearchClick = (query, type) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=${type}&page=1`);
  };

  // Group history items by date
  const grouped = history.reduce((acc, item) => {
    const dateLabel = formatHistoryDate(item.timestamp);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(item);
    return acc;
  }, {});

  return (
    <main className="flex-1">
      <PageContainer className="py-8">
        <div className="max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Search History</h1>
              <p className="text-sm text-text-secondary mt-1">
                Your recent searches
              </p>
            </div>
            {history.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    if (window.confirm(`Are you sure you want to clear history for: ${e.target.options[e.target.selectedIndex].text}?`)) {
                      if (e.target.value === 'all') {
                        clearHistory();
                      } else {
                        clearHistoryByTimeframe(e.target.value);
                      }
                    }
                    e.target.value = ''; // Reset select
                  }
                }}
                className="px-4 py-2 text-xs font-medium text-text-secondary bg-surface-secondary rounded-lg hover:text-danger hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border-none cursor-pointer appearance-none text-center"
                defaultValue=""
              >
                <option value="" disabled>Clear history...</option>
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="all">Clear all</option>
              </select>
            )}
          </div>

          {/* History list */}
          <div className="mt-6">
            {history.length === 0 ? (
              <EmptyState
                title="No search history"
                description="Your search history will appear here after you start searching."
                actionLabel="Start searching"
                actionTo="/"
                icon={
                  <svg className="w-16 h-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
              />
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([dateLabel, items]) => (
                  <div key={dateLabel}>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                      {dateLabel}
                    </p>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors"
                        >
                          {/* Search icon */}
                          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                          </svg>

                          {/* Query */}
                          <button
                            onClick={() => handleSearchClick(item.query, item.type)}
                            className="flex-1 text-left text-sm text-text-primary hover:text-accent transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded"
                          >
                            {item.query}
                          </button>

                          {/* Type badge */}
                          {item.type !== 'web' && (
                            <span className="text-[11px] text-text-muted capitalize shrink-0">
                              {item.type}
                            </span>
                          )}

                          {/* Remove */}
                          <button
                            onClick={() => removeFromHistory(item.id)}
                            className="shrink-0 p-1.5 text-text-muted hover:text-danger transition-colors rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={`Remove "${item.query}" from history`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
