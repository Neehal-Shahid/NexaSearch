import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/feedback/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { formatHistoryDate } from '../utils/formatters';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, removeFromHistory, clearHistory, clearHistoryByTimeframe } = useSearchHistory();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, value: null, label: null });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (value, label) => {
    setModalConfig({ isOpen: true, value, label });
    setIsDropdownOpen(false);
  };

  const executeClear = () => {
    if (modalConfig.value === 'all') {
      clearHistory();
    } else {
      clearHistoryByTimeframe(modalConfig.value);
    }
  };

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-secondary rounded-lg hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Clear History
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                      {[
                        { label: 'Last 15 minutes', value: '15m' },
                        { label: 'Last 1 hour', value: '1h' },
                        { label: 'Last 24 hours', value: '24h' },
                        { label: 'Last 7 days', value: '7d' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleClear(opt.value, opt.label)}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                      <div className="h-px bg-border-subtle my-1"></div>
                      <button
                        onClick={() => handleClear('all', 'All time')}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-danger hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        Clear all time
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={executeClear}
        title="Clear Search History"
        message={
          modalConfig.value === 'all'
            ? "Are you sure you want to completely clear your search history? This action cannot be undone."
            : `Are you sure you want to clear your search history for the ${modalConfig.label.toLowerCase()}?`
        }
        confirmText="Clear History"
        confirmStyle="danger"
      />
    </main>
  );
}
