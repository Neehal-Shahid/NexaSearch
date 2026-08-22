import { formatDate, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function NewsResultCard({ result }) {
  const imageUrl = result.thumbnail;
  const source = result.source?.name || result.source;

  return (
    <article className="group rounded-xl border border-border-subtle overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        {imageUrl && (
          <div className="aspect-[16/9] overflow-hidden bg-surface-secondary">
            <img
              src={imageUrl}
              alt={result.title || 'News article'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="p-4">
          {/* Source and date */}
          <div className="flex items-center gap-2 mb-2">
            {source && (
              <span className="text-xs font-medium text-accent">{source}</span>
            )}
            {result.date && (
              <>
                <span className="text-text-muted text-xs">·</span>
                <span className="text-xs text-text-muted">{formatDate(result.date)}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {result.title}
          </h3>

          {/* Snippet */}
          {result.snippet && (
            <p className="mt-1.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
              {truncateText(result.snippet, 120)}
            </p>
          )}
        </div>
      </a>

      {/* Save button */}
      <div className="px-4 pb-3 flex justify-end">
        <SaveButton result={result} type="news" size="sm" />
      </div>
    </article>
  );
}
