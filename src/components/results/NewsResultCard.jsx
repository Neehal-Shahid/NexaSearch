import { formatDate, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

// Three distinct treatments, not one card reused at different sizes:
// - 'inline': compact row used inside the web-results Top Stories pack
// - 'featured': the single lead story on the News tab — big image, big headline
// - 'list': every other story on the News tab — small thumbnail, text-forward,
//   borderless (the parent's spacing does the separating, not a box per item)
export default function NewsResultCard({ result, variant = 'list' }) {
  const imageUrl = result.thumbnail || result.source?.icon;
  const source = result.source?.name || result.source;
  const snippet = result.snippet || result.highlight;

  if (variant === 'inline') {
    return (
      <article className="group">
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 focus-visible:outline-none"
        >
          {imageUrl && (
            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-surface-secondary">
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {source && (
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide truncate mb-1">{source}</p>
            )}
            <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
              {result.title}
            </h3>
          </div>
        </a>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="group relative">
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center focus-visible:outline-none"
        >
          {imageUrl && (
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-500 ease-out group-hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)]">
              <img
                src={imageUrl}
                alt={result.title || 'News article'}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {source && <span className="text-xs font-semibold text-accent uppercase tracking-wide">{source}</span>}
              {result.date && (
                <>
                  <span className="w-1 h-1 rounded-full bg-text-muted" />
                  <span className="text-xs text-text-muted">{formatDate(result.date)}</span>
                </>
              )}
            </div>
            <h3 className="text-2xl font-bold text-text-primary leading-tight group-hover:text-accent transition-colors duration-200">
              {result.title}
            </h3>
            {snippet && (
              <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3">
                {truncateText(snippet, 180)}
              </p>
            )}
          </div>
        </a>
        <div className="absolute top-3 right-3 sm:top-0 sm:right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SaveButton result={result} type="news" size="sm" />
        </div>
      </article>
    );
  }

  // 'list'
  return (
    <article className="group flex gap-4 items-start">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-4 flex-1 min-w-0 focus-visible:outline-none"
      >
        {imageUrl && (
          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-surface-secondary">
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2 mb-1.5">
            {source && <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide truncate">{source}</span>}
            {result.date && <span className="text-[11px] text-text-muted shrink-0">· {formatDate(result.date)}</span>}
          </div>
          <h3 className="text-[15px] font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
            {result.title}
          </h3>
        </div>
      </a>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <SaveButton result={result} type="news" size="sm" />
      </div>
    </article>
  );
}
