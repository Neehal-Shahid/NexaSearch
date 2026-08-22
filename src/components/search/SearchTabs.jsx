import { useSearchParams } from 'react-router-dom';
import { SEARCH_TABS } from '../../constants';

export default function SearchTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentType = searchParams.get('type') || 'web';

  const handleTabChange = (type) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', type);
    newParams.set('page', '1'); // Reset to page 1 when switching tabs
    setSearchParams(newParams);
  };

  return (
    <div className="border-b border-border" role="tablist" aria-label="Search result types">
      <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px">
        {SEARCH_TABS.map(({ key, label }) => {
          const isActive = currentType === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
