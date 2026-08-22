import { useNavigate } from 'react-router-dom';

export default function TrendingSearches({ searches }) {
  const navigate = useNavigate();

  const handleClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=web&page=1`);
  };

  if (!searches || searches.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        Trending
      </p>
      <div className="flex flex-wrap gap-2">
        {searches.map((query) => (
          <button
            key={query}
            onClick={() => handleClick(query)}
            className="px-3.5 py-2 text-sm text-text-secondary bg-surface-secondary rounded-lg hover:bg-border-subtle hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
