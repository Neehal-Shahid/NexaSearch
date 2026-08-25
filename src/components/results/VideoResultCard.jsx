import { formatDuration } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function VideoResultCard({ result, variant = 'default' }) {
  const thumbnail = result.thumbnail?.static || result.thumbnail;
  const isInline = variant === 'inline';

  return (
    <article className="group flex flex-col">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-none"
      >
        {/* Borderless tile — elevation on hover (shadow + lift) instead of a
            bordered box, so the thumbnail reads as artwork, not a form field. */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out group-hover:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.18)] group-hover:-translate-y-1">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={result.title || 'Video thumbnail'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Duration */}
          {result.length && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-1 text-[10px] tracking-wider font-bold text-white bg-black/75 rounded-md backdrop-blur-sm">
              {formatDuration(result.length)}
            </span>
          )}

          {/* Play affordance */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/95 shadow-lg">
              <svg className="w-5 h-5 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>

          {!isInline && (
            <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <SaveButton result={result} type="video" size="sm" />
            </div>
          )}
        </div>

        {/* Caption sits below the tile as calm text, not another boxed section */}
        <div className="mt-3">
          <h3 className={`font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200 ${isInline ? 'text-sm' : 'text-[15px]'}`}>
            {result.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            {result.channel && (
              <span className="text-xs font-medium text-text-muted truncate">{result.channel}</span>
            )}
            {result.date && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-text-muted shrink-0" />
                <span className="text-xs text-text-muted shrink-0">{result.date}</span>
              </>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
