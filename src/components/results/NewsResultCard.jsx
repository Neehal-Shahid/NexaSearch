import { formatDate, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function NewsResultCard({ result, variant = 'default' }) {
  const imageUrl = result.thumbnail || result.source?.icon;
  const source = result.source?.name || result.source;
  const snippet = result.snippet || result.highlight;
  const isInline = variant === 'inline';

  return (
    <article className={`group rounded-xl border border-border-subtle bg-surface hover:bg-surface-secondary overflow-hidden transition-all duration-300 hover:border-border hover:shadow-md flex ${isInline ? 'flex-row h-24 sm:h-28' : 'flex-col h-full'}`}>
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${isInline ? 'flex flex-row h-full' : ''}`}
      >
        {imageUrl && (
          <div className={`${isInline ? 'w-28 sm:w-36 h-full shrink-0 border-r' : 'aspect-[16/9] border-b'} overflow-hidden bg-surface-secondary border-border-subtle`}>
            <img
              src={imageUrl}
              alt={result.title || 'News article'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className={`p-4 ${isInline ? 'flex-1 min-w-0 flex flex-col justify-center' : 'p-5'}`}>
          {/* Source and date */}
          <div className="flex items-center gap-2 mb-2">
            {source && (
              <span className="text-xs font-semibold tracking-wide text-text-primary uppercase truncate">{source}</span>
            )}
            {result.date && (
              <>
                <span className="text-border text-xs">|</span>
                <span className="text-xs text-text-muted font-medium whitespace-nowrap">{formatDate(result.date)}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-base font-semibold text-accent leading-snug transition-transform duration-200 group-hover:scale-[1.015] origin-left ${isInline ? 'line-clamp-2 sm:line-clamp-3 text-sm sm:text-base' : 'line-clamp-3'}`}>
            {result.title}
          </h3>

          {/* Snippet */}
          {!isInline && snippet && (
            <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-2">
              {truncateText(snippet, 140)}
            </p>
          )}
        </div>
      </a>

      {/* Save button */}
      {!isInline && (
        <div className="px-5 pb-4 pt-2 flex justify-end mt-auto border-t border-border-subtle/50">
          <SaveButton result={result} type="news" size="sm" />
        </div>
      )}
    </article>
  );
}
