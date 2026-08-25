import VideoResultCard from './VideoResultCard';

export default function VideoResultGrid({ results, variant = 'default' }) {
  if (!results || results.length === 0) return null;

  return (
    <div className={`grid ${variant === 'inline' ? 'grid-cols-2 md:grid-cols-4 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}`}>
      {results.map((result, index) => (
        <VideoResultCard key={result.link || index} result={result} variant={variant} />
      ))}
    </div>
  );
}
