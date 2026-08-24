import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchHistory } from '../../context/SearchHistoryContext';

export default function SearchBar({ variant = 'hero', autoFocus = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const { history, removeQueryFromHistory } = useSearchHistory();

  // Sync input with URL when user navigates using back/forward buttons
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    };
    const handleGlobalKeyDown = (event) => {
      // Focus search bar when '/' is pressed outside of any input
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;

    setIsFocused(false);
    const type = searchParams.get('type') || 'web';
    navigate(`/search?q=${encodeURIComponent(trimmed)}&type=${type}&page=1`);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setIsFocused(false);
    const type = searchParams.get('type') || 'web';
    navigate(`/search?q=${encodeURIComponent(suggestion)}&type=${type}&page=1`);
  };

  const handleRemoveSuggestion = (e, suggestion) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the suggestion click
    removeQueryFromHistory(suggestion);
  };

  const isHero = variant === 'hero';

  // Get unique history queries
  const uniqueHistory = Array.from(new Set(history.map(h => h.query)));
  const suggestions = query.trim()
    ? uniqueHistory.filter(q => q.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : uniqueHistory.slice(0, 5);

  const handleKeyDown = (e) => {
    if (!isFocused || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative" role="search" ref={containerRef}>
      <label htmlFor="search-input" className="sr-only">
        Search the web
      </label>
      <div
        className={`flex items-center w-full bg-white border transition-all duration-300 ${
          isHero
            ? 'border-border rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] focus-within:shadow-[0_4px_20px_rgb(0,0,0,0.04)] focus-within:border-text-muted focus-within:ring-1 focus-within:ring-text-muted'
            : 'border-border rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_2px_15px_rgb(0,0,0,0.03)] focus-within:shadow-[0_2px_15px_rgb(0,0,0,0.03)] focus-within:border-text-muted focus-within:ring-1 focus-within:ring-text-muted'
        }`}
      >
        {/* Search Icon */}
        <div className={`shrink-0 flex items-center justify-center ${isHero ? 'pl-5 pr-3' : 'pl-4 pr-2'}`}>
          <svg
            className={`text-text-muted transition-colors duration-200 ${
              isHero ? 'w-5 h-5' : 'w-4 h-4'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          className={`w-full bg-transparent border-none focus:ring-0 text-text-primary placeholder:text-text-muted focus-visible:outline-none ${
            isHero ? 'py-4 text-lg' : 'py-2.5 text-sm'
          }`}
        />

        {/* Actions (Clear & Submit) */}
        <div className={`shrink-0 flex items-center ${isHero ? 'pr-2' : 'pr-1.5'}`}>
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsFocused(false);
                navigate('/');
              }}
              className={`text-text-muted hover:text-text-secondary transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-muted ${
                isHero ? 'p-2.5 mr-1' : 'p-2 mr-0.5'
              }`}
              aria-label="Clear search"
            >
              <svg className={isHero ? "w-5 h-5" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={query.trim().length === 0}
            className={`font-semibold text-white bg-primary rounded-xl transition-all duration-300 hover:bg-primary-hover active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isHero ? 'px-6 sm:px-8 py-3 text-sm' : 'px-4 sm:px-5 py-2 text-xs'
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && query.trim().length > 0 && suggestions.length > 0 && (
        <div className={`absolute left-0 right-0 z-50 bg-white border border-border-subtle rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isHero ? 'top-[calc(100%+0.75rem)]' : 'top-[calc(100%+0.5rem)]'}`}>
          <ul className="py-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className={`group flex items-center transition-colors ${selectedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex-1 text-left px-5 flex items-center gap-3 text-text-primary focus-visible:outline-none focus-visible:bg-gray-100 ${
                    isHero ? 'py-3' : 'py-2.5'
                  }`}
                >
                  <svg className={`text-text-muted shrink-0 ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`font-medium ${isHero ? 'text-base' : 'text-sm'}`}>{suggestion}</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => handleRemoveSuggestion(e, suggestion)}
                  className="p-2 mr-3 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:text-red-500 rounded-lg"
                  aria-label="Remove suggestion"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
