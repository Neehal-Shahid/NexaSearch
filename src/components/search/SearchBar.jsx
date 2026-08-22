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
            ? 'border-border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10'
            : 'border-border rounded-xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10'
        }`}
      >
        <svg
          className={`shrink-0 text-text-muted ${isHero ? 'w-5 h-5 ml-5' : 'w-[18px] h-[18px] ml-4'}`}
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
          placeholder="Search the web..."
          autoFocus={autoFocus}
          autoComplete="off"
          className={`flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted ${
            isHero ? 'py-4 px-4 text-base' : 'py-3 px-3 text-sm'
          }`}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="shrink-0 p-2 mr-1 text-text-muted hover:text-text-secondary transition-colors rounded-lg"
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
          className={`shrink-0 font-bold text-white bg-brand-gradient rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isHero ? 'px-8 py-3 mr-2 text-sm shadow-md' : 'px-5 py-2 mr-1.5 text-xs shadow-sm'
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
