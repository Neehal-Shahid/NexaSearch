import VideoResultCard from './VideoResultCard';

export default function VideoResultGrid({ results, variant = 'default' }) {
  if (!results || results.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((result, index) => (
          <VideoResultCard key={result.link || index} result={result} variant={variant} />
        ))}
      </div>
    );
  }

  // The Videos tab leads with one featured video (bigger thumbnail, visible
  // title/snippet, not just revealed on hover) instead of a uniform grid of
  // identical tiles — same editorial hierarchy the News tab already has.
  const [featured, ...rest] = results;

  return (
    <div className="space-y-8">
      <VideoResultCard result={featured} variant="featured" />
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 pt-6 border-t border-border-subtle">
          {rest.map((result, index) => (
            <VideoResultCard key={result.link || index} result={result} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}
