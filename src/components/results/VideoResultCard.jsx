import { formatDuration } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function VideoResultCard({ result, variant = 'default' }) {
  const thumbnail = result.thumbnail?.static || result.thumbnail;
  const isInline = variant === 'inline';

  return (
    <article className="group flex flex-col h-full bg-surface rounded-xl border border-border-subtle hover:border-border hover:shadow-md transition-all duration-300 overflow-hidden">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${isInline ? 'pb-4' : ''}`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-surface-secondary border-b border-border-subtle">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={result.title || 'Video thumbnail'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Duration badge */}
          {result.length && (
            <span className="absolute bottom-2 right-2 px-2 py-1 text-[10px] tracking-wider font-bold text-white bg-black/80 rounded backdrop-blur-sm">
              {formatDuration(result.length)}
            </span>
          )}

          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className={`text-base font-semibold text-accent leading-snug transition-transform duration-200 group-hover:scale-[1.015] origin-left ${isInline ? 'line-clamp-2 text-sm' : 'line-clamp-2'}`}>
            {result.title}
          </h3>

          <div className="flex items-center gap-2 mt-3">
            {result.channel && (
              <span className="text-xs font-semibold tracking-wide text-text-primary uppercase truncate">{result.channel}</span>
            )}
            {result.date && (
              <>
                <span className="text-border text-xs shrink-0">|</span>
                <span className="text-xs text-text-muted font-medium shrink-0">{result.date}</span>
              </>
            )}
          </div>
        </div>
      </a>

      {/* Save button */}
      {!isInline && (
        <div className="px-4 pb-4 pt-2 flex justify-end mt-auto border-t border-border-subtle/50">
          <SaveButton result={result} type="video" size="sm" />
        </div>
      )}
    </article>
  );
}
