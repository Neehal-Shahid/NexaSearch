import { extractDomain, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

export default function WebResultItem({ result }) {
  const domain = result.displayed_link || extractDomain(result.link || '');

  return (
    <article className="group py-4 -mx-3 px-3 rounded-xl transition-colors duration-150 hover:bg-surface-secondary">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Source / domain */}
          <div className="flex items-center gap-2 mb-1">
            {result.favicon && (
              <img
                src={result.favicon}
                alt=""
                className="w-4 h-4 rounded-sm shrink-0"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className="text-xs text-text-secondary truncate">{domain}</span>
          </div>

          {/* Title */}
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-accent hover:text-accent-hover transition-colors duration-150 line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded"
          >
            {result.title}
          </a>

          {/* Snippet */}
          {result.snippet && (
            <p className="mt-1 text-sm text-text-secondary leading-relaxed line-clamp-2">
              {truncateText(result.snippet, 200)}
            </p>
          )}
        </div>

        {/* Save button */}
        <SaveButton result={result} type="web" size="sm" />
      </div>
    </article>
  );
}
