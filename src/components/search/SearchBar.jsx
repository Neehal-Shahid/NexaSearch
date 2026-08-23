import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchBar({ variant = 'hero', autoFocus = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;

    const type = searchParams.get('type') || 'web';
    navigate(`/search?q=${encodeURIComponent(trimmed)}&type=${type}&page=1`);
  };

  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
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
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
                document.getElementById('search-input')?.focus();
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
    </form>
  );
}
