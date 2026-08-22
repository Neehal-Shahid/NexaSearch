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
        className={`relative flex items-center w-full bg-white border transition-all duration-300 ${
          isHero
            ? 'border-border rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] focus-within:shadow-[0_4px_20px_rgb(0,0,0,0.04)] focus-within:border-text-muted focus-within:ring-1 focus-within:ring-text-muted'
            : 'border-border rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_2px_15px_rgb(0,0,0,0.03)] focus-within:shadow-[0_2px_15px_rgb(0,0,0,0.03)] focus-within:border-text-muted focus-within:ring-1 focus-within:ring-text-muted'
        }`}
      >
        <svg
          className={`absolute left-4 text-text-muted transition-colors duration-200 ${
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
            isHero ? 'py-4 pl-12 pr-32 text-lg' : 'py-2.5 pl-10 pr-24 text-sm'
          }`}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-20 shrink-0 p-2 text-text-muted hover:text-text-secondary transition-colors rounded-lg"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          disabled={query.trim().length === 0}
          className={`shrink-0 font-medium text-white bg-primary rounded-xl transition-all duration-300 hover:bg-primary-hover active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isHero ? 'px-8 py-3 mr-2 text-sm' : 'px-5 py-2 mr-1.5 text-xs'
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
