import { extractDomain, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function WebResultItem({ result }) {
  const domain = result.displayed_link || extractDomain(result.link || '');

  return (
    <article className="group py-5 border-b border-border-subtle last:border-0 transition-colors duration-200 hover:bg-surface/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Source / domain */}
          <div className="flex items-center gap-2.5 mb-2">
            {result.favicon ? (
              <img
                src={result.favicon}
                alt=""
                className="w-4 h-4 rounded-full shrink-0 ring-1 ring-border"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-border shrink-0" />
            )}
            <span className="text-xs font-medium text-text-secondary truncate tracking-wide">{domain}</span>
          </div>

          {/* Title */}
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-text-primary hover:text-accent transition-colors duration-150 line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded leading-tight"
          >
            {result.title}
          </a>

          {/* Snippet */}
          {result.snippet && (
            <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-2">
              {truncateText(result.snippet, 200)}
            </p>
          )}
        </div>

        {/* Save button */}
        <div className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SaveButton result={result} type="web" size="sm" />
        </div>
      </div>
    </article>
  );
}
