import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { useTrendingSearches } from '../../hooks/useTrendingSearches';

// Deliberately excludes /admin — this palette is visible to every visitor
// via a global keyboard shortcut, and the admin dashboard shouldn't be
// advertised to normal users even though it's password-gated behind that
// link. Anyone who needs it knows the URL already.
const NAV_ITEMS = [
  { id: 'nav-home', label: 'Home', path: '/' },
  { id: 'nav-saved', label: 'Saved Results', path: '/saved' },
  { id: 'nav-history', label: 'Search History', path: '/history' },
  { id: 'nav-about', label: 'About', path: '/about' },
  { id: 'nav-privacy', label: 'Privacy Policy', path: '/privacy' },
  { id: 'nav-terms', label: 'Terms of Service', path: '/terms' },
];

const ClockIcon = () => (
  <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
  </svg>
);

const NavIcon = () => (
  <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

function itemIcon(item) {
  if (item.type === 'nav') return <NavIcon />;
  if (item.isFreeText) return <SearchIcon />;
  if (item.section === 'Trending') return <TrendingIcon />;
  return <ClockIcon />;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { getRecentSearches, removeQueryFromHistory } = useSearchHistory();
  const { trends } = useTrendingSearches();
  const inputRef = useRef(null);
  const listRef = useRef(null);

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

  const recentSearches = getRecentSearches(5);

  // A single flat, keyboard-navigable list — this is the core fix: the
  // palette used to stop being interactive the moment you typed anything
  // (just "press Enter to search"), with no filtering and no arrow-key
  // navigation through any of its sections at all.
  const items = useMemo(() => {
    const recentItems = recentSearches.map((h) => ({
      id: `recent-${h.id}`,
      type: 'search',
      section: 'Recent Searches',
      label: h.query,
      query: h.query,
      removable: true,
    }));
    const trendingItems = trends.slice(0, 6).map((t, i) => ({
      id: `trending-${i}-${t.query}`,
      type: 'search',
      section: 'Trending',
      label: t.query,
      query: t.query,
    }));
    const navItems = NAV_ITEMS.map((n) => ({
      id: n.id,
      type: 'nav',
      section: 'Navigation',
      label: n.label,
      path: n.path,
    }));

    const all = [...recentItems, ...trendingItems, ...navItems];
    const trimmed = query.trim();

    if (!trimmed) return all;

    const q = trimmed.toLowerCase();
    const filtered = all.filter((item) => item.label.toLowerCase().includes(q));

    // Always offer free-text search as a fallback action, even when there
    // are matches — the user typed a real query, not just a filter term.
    filtered.push({
      id: 'freetext',
      type: 'search',
      section: null,
      label: `Search for "${trimmed}"`,
      query: trimmed,
      isFreeText: true,
    });

    return filtered;
  }, [query, recentSearches, trends]);

  // Reset the highlighted item whenever the list changes so it never points
  // past the end of a shorter filtered list.
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isOpen]);

  const activateItem = (item) => {
    if (!item) return;
    setIsOpen(false);
    if (item.type === 'nav') {
      navigate(item.path);
    } else {
      navigate(`/search?q=${encodeURIComponent(item.query)}&type=web&page=1`);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length === 0 ? 0 : (prev + 1) % items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length === 0 ? 0 : (prev - 1 + items.length) % items.length));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length > 0) {
      activateItem(items[selectedIndex] ?? items[0]);
      return;
    }
    const trimmed = query.trim();
    if (trimmed) {
      activateItem({ type: 'search', query: trimmed });
    }
  };

  const handleRemove = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    removeQueryFromHistory(item.query);
  };

  if (!isOpen) return null;

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
            placeholder="Search, or jump to a page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={items[selectedIndex] ? `cmdk-${items[selectedIndex].id}` : undefined}
          />
          <div className="absolute right-4 flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-text-muted bg-surface-secondary border border-border rounded">
              ESC
            </kbd>
          </div>
        </form>

        <div ref={listRef} id="command-palette-list" role="listbox" className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-text-muted text-center">
              Type something and press Enter to search.
            </div>
          ) : (
            items.map((item, idx) => {
              const isNewSection = idx === 0 || items[idx - 1].section !== item.section;
              const isSelected = idx === selectedIndex;

              return (
                <div key={item.id}>
                  {isNewSection && item.section && (
                    <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 mt-4 first:mt-2">
                      {item.section}
                    </h3>
                  )}
                  <div
                    className={`group flex items-center rounded-xl transition-colors ${isSelected ? 'bg-surface-secondary' : 'hover:bg-surface-secondary'}`}
                  >
                    <button
                      id={`cmdk-${item.id}`}
                      data-idx={idx}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => activateItem(item)}
                      className={`flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 text-sm text-left focus-visible:outline-none ${
                        isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                      }`}
                    >
                      {itemIcon(item)}
                      <span className="truncate">{item.label}</span>
                    </button>
                    {item.removable && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => handleRemove(e, item)}
                        className="p-2 mr-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all rounded-lg focus-visible:outline-none focus-visible:text-red-500"
                        aria-label={`Remove "${item.label}" from recent searches`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
