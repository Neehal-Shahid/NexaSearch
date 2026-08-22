const ShimmerBlock = ({ className = '', style = {} }) => (
  <div 
    className={`relative overflow-hidden bg-slate-100/80 rounded-md ${className}`}
    style={style}
  >
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-smart-shimmer" />
  </div>
);

export default function LoadingSkeleton({ type = 'web', count = 6 }) {
  if (type === 'web') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500" role="status" aria-label="Processing intelligent results...">
        {/* Mocking the NexaOverview loading state to prevent layout shift */}
        <div className="mb-8 rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="h-1.5 w-full bg-slate-100" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-border-subtle pb-4">
              <ShimmerBlock className="w-8 h-8 rounded-full" />
              <ShimmerBlock className="h-4 w-32" />
            </div>
            <div className="space-y-4">
              <ShimmerBlock className="h-5 w-3/4" />
              <ShimmerBlock className="h-4 w-full" />
              <ShimmerBlock className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3 py-2">
            <div className="flex items-center gap-3">
              <ShimmerBlock className="w-6 h-6 rounded-full shrink-0" />
              <ShimmerBlock className="h-4 w-40" />
            </div>
            <ShimmerBlock className="h-6 w-3/4 rounded-lg" />
            <div className="space-y-2 pt-1">
              <ShimmerBlock className="h-4 w-full" />
              <ShimmerBlock className="h-4 w-5/6" />
            </div>
          </div>
        ))}
        <span className="sr-only">Processing data...</span>
      </div>
    );
  }

  if (type === 'images') {
    return (
      <div className="image-masonry animate-in fade-in duration-500" role="status" aria-label="Processing image grid...">
        {Array.from({ length: 12 }).map((_, i) => (
          <ShimmerBlock
            key={i}
            className="rounded-xl shadow-sm mb-4"
            style={{ height: `${160 + Math.random() * 140}px` }}
          />
        ))}
        <span className="sr-only">Processing images...</span>
      </div>
    );
  }

  if (type === 'news') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500" role="status" aria-label="Processing news results...">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-subtle overflow-hidden bg-white shadow-sm">
            <ShimmerBlock className="h-48 w-full rounded-none" />
            <div className="p-5 space-y-4">
              <ShimmerBlock className="h-4 w-28" />
              <ShimmerBlock className="h-6 w-full" />
              <ShimmerBlock className="h-4 w-4/5" />
            </div>
          </div>
        ))}
        <span className="sr-only">Processing news...</span>
      </div>
    );
  }

  if (type === 'videos') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500" role="status" aria-label="Processing video results...">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3 bg-white p-2 rounded-xl">
            <ShimmerBlock className="aspect-video w-full rounded-lg" />
            <div className="px-2 pb-2 space-y-3 pt-2">
              <ShimmerBlock className="h-5 w-11/12" />
              <div className="flex gap-2">
                <ShimmerBlock className="h-4 w-20" />
                <ShimmerBlock className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
        <span className="sr-only">Processing videos...</span>
      </div>
    );
  }

  return null;
}
