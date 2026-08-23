import { useNavigate } from 'react-router-dom';

export default function RelatedSearches({ searches }) {
  const navigate = useNavigate();

  if (!searches || searches.length === 0) return null;

  const handleClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=web&page=1`);
  };

  return (
    <section className="mt-12 pt-8 border-t border-border-subtle">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <h3 className="text-base font-semibold text-text-primary">Related searches</h3>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {searches.slice(0, 8).map((item) => {
          const query = item.query || item;
          return (
            <button
              key={query}
              onClick={() => handleClick(query)}
              className="px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-secondary border border-border-subtle rounded-full hover:border-accent hover:text-accent hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {query}
            </button>
          );
        })}
      </div>
    </section>
  );
}
