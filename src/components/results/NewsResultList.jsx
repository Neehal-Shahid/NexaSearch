import { useState } from 'react';
import NewsResultCard from './NewsResultCard';

export default function NewsResultList({ results, variant = 'default' }) {
  const [visibleCount, setVisibleCount] = useState(variant === 'inline' ? 3 : 10);

  if (!results || results.length === 0) return null;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = variant === 'default' && visibleCount < results.length;

  // The full News tab leads with one featured story (big image, big
  // headline) and treats everything after it as a calm, borderless list —
  // not a uniform grid of identical cards. The inline pack (shown inside
  // web results) stays a simple compact stack; it's supplementary content,
  // not the main event.
  const [featured, ...rest] = variant === 'default' ? visibleResults : [];

  return (
    <div className={variant === 'inline' ? 'space-y-3' : 'space-y-8'}>
      {variant === 'default' && (
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Top Stories</h2>
        </div>
      )}

      {variant === 'inline' ? (
        <div className="flex flex-col gap-3">
          {visibleResults.map((result, index) => (
            <NewsResultCard key={result.link || index} result={result} variant="inline" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {featured && <NewsResultCard result={featured} variant="featured" />}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2 border-t border-border-subtle">
              {rest.map((result, index) => (
                <NewsResultCard key={result.link || index} result={result} variant="list" />
              ))}
            </div>
          )}
        </div>
      )}

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
