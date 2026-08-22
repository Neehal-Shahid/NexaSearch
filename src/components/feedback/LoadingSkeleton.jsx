export default function LoadingSkeleton({ type = 'web', count = 6 }) {
  if (type === 'web') {
    return (
      <div className="space-y-6" role="status" aria-label="Loading search results">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2.5 py-4">
            <div className="flex items-center gap-2">
              <div className="skeleton w-5 h-5 rounded-full shrink-0" />
              <div className="skeleton h-3.5 w-32" />
            </div>
            <div className="skeleton h-5 w-3/4" />
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-full" />
              <div className="skeleton h-3.5 w-5/6" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (type === 'images') {
    return (
      <div className="image-masonry" role="status" aria-label="Loading image results">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skeleton rounded-lg"
            style={{ height: `${140 + Math.random() * 120}px` }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (type === 'news') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" role="status" aria-label="Loading news results">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle overflow-hidden">
            <div className="skeleton h-44 w-full rounded-none" />
            <div className="p-4 space-y-2.5">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-5 w-full" />
              <div className="skeleton h-3.5 w-5/6" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (type === 'videos') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="status" aria-label="Loading video results">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <div className="skeleton aspect-video w-full rounded-lg" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return null;
}
