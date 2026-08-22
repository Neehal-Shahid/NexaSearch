import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { TRENDING_SEARCHES } from '../../constants';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { getRecentSearches } = useSearchHistory();
  const inputRef = useRef(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus management and lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small timeout to ensure input is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;

    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}&type=web&page=1`);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    if (typeof action === 'string') { // It's a path
      navigate(action);
    } else { // It's a query
      navigate(`/search?q=${encodeURIComponent(action)}&type=web&page=1`);
    }
  };

  if (!isOpen) return null;

  const recentSearches = getRecentSearches(4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Palette */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <form onSubmit={handleSubmit} className="relative border-b border-border-subtle flex items-center">
          <svg className="absolute left-4 w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 pl-12 pr-4 py-4 text-lg text-text-primary placeholder:text-text-muted focus:ring-0 outline-none"
            placeholder="Search or jump to..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute right-4 flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-text-muted bg-surface-secondary border border-border rounded">
              ESC
            </kbd>
          </div>
        </form>

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 mt-2">Recent Searches</h3>
              <ul className="space-y-1">
                {recentSearches.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleAction(item.query)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary rounded-xl hover:bg-surface-secondary hover:text-text-primary focus:bg-surface-secondary focus:text-text-primary focus:outline-none transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="truncate">{item.query}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trending Searches */}
          {query.length === 0 && (
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 mt-2">Trending</h3>
              <ul className="space-y-1">
                {TRENDING_SEARCHES.slice(0, 4).map((item) => (
                  <li key={item.query}>
                    <button
                      onClick={() => handleAction(item.query)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary rounded-xl hover:bg-surface-secondary hover:text-text-primary focus:bg-surface-secondary focus:text-text-primary focus:outline-none transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                      </svg>
                      <span className="truncate">{item.query}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          {query.length === 0 && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 mt-2">Navigation</h3>
              <ul className="space-y-1">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Saved Results', path: '/saved' },
                  { name: 'Search History', path: '/history' }
                ].map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleAction(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary rounded-xl hover:bg-surface-secondary hover:text-text-primary focus:bg-surface-secondary focus:text-text-primary focus:outline-none transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                      </svg>
                      <span className="truncate">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.length > 0 && (
            <div className="p-3 text-sm text-text-secondary text-center">
              Press Enter to search for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
