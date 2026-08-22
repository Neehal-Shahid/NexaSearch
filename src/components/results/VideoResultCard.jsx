import { formatDuration } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function VideoResultCard({ result }) {
  const thumbnail = result.thumbnail?.static || result.thumbnail;

  return (
    <article className="group">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-secondary mb-2.5">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={result.title || 'Video thumbnail'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Duration badge */}
          {result.length && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-medium text-white bg-black/80 rounded">
              {formatDuration(result.length)}
            </span>
          )}

          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {result.title}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          {result.channel && (
            <span className="text-xs text-text-secondary">{result.channel}</span>
          )}
          {result.date && (
            <>
              <span className="text-text-muted text-xs">·</span>
              <span className="text-xs text-text-muted">{result.date}</span>
            </>
          )}
        </div>
      </a>

      {/* Save button */}
      <div className="flex justify-end mt-1">
        <SaveButton result={result} type="video" size="sm" />
      </div>
    </article>
  );
}
