import { useNavigate } from 'react-router-dom';

export default function RelatedSearches({ searches }) {
  const navigate = useNavigate();

  if (!searches || searches.length === 0) return null;

  const handleClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=web&page=1`);
  };

  return (
    <section className="mt-8 pt-6 border-t border-border-subtle">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Related searches</h3>
      <div className="flex flex-wrap gap-2">
        {searches.slice(0, 8).map((item) => {
          const query = item.query || item;
          return (
            <button
              key={query}
              onClick={() => handleClick(query)}
              className="px-3.5 py-2 text-sm text-text-secondary bg-surface-secondary rounded-lg hover:bg-border-subtle hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {query}
            </button>
          );
        })}
      </div>
    </section>
  );
}
