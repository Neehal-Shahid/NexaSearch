import { useState } from 'react';
import NewsResultCard from './NewsResultCard';

export default function NewsResultList({ results }) {
  const [visibleCount, setVisibleCount] = useState(10);

  if (!results || results.length === 0) return null;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleResults.map((result, index) => (
          <NewsResultCard key={result.link || index} result={result} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="group px-8 py-3.5 bg-surface hover:bg-primary text-sm font-bold text-text-primary hover:text-white border border-border-subtle hover:border-primary rounded-full transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Investigate Deeper
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
