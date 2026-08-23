import { formatDate, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function NewsResultCard({ result }) {
  const imageUrl = result.thumbnail || result.source?.icon;
  const source = result.source?.name || result.source;
  const snippet = result.snippet || result.highlight;

  return (
    <article className="group rounded-xl border border-border-subtle bg-surface hover:bg-surface-secondary overflow-hidden transition-all duration-300 hover:border-border hover:shadow-md flex flex-col h-full">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        {imageUrl && (
          <div className="aspect-[16/9] overflow-hidden bg-surface-secondary border-b border-border-subtle">
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
        <div className="p-5">
          {/* Source and date */}
          <div className="flex items-center gap-2 mb-3">
            {source && (
              <span className="text-xs font-semibold tracking-wide text-text-primary uppercase">{source}</span>
            )}
            {result.date && (
              <>
                <span className="text-border text-xs">|</span>
                <span className="text-xs text-text-muted font-medium">{formatDate(result.date)}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-accent leading-snug line-clamp-3 transition-transform duration-200 group-hover:scale-[1.015] origin-left">
            {result.title}
          </h3>

          {/* Snippet */}
          {snippet && (
            <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-2">
              {truncateText(snippet, 140)}
            </p>
          )}
        </div>
      </a>

      {/* Save button */}
      <div className="px-5 pb-4 pt-2 flex justify-end mt-auto border-t border-border-subtle/50">
        <SaveButton result={result} type="news" size="sm" />
      </div>
    </article>
  );
}
