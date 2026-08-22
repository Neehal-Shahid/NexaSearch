import { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/feedback/EmptyState';
import SaveButton from '../components/ui/SaveButton';
import { useSavedResults } from '../context/SavedResultsContext';
import { extractDomain, truncateText } from '../utils/formatters';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'web', label: 'Web' },
  { key: 'image', label: 'Images' },
  { key: 'news', label: 'News' },
  { key: 'video', label: 'Videos' },
];

export default function SavedPage() {
  const { savedResults, removeResult } = useSavedResults();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? savedResults
    : savedResults.filter((item) => item.type === filter);

  return (
    <main className="flex-1">
      <PageContainer className="py-8">
        <div className="max-w-3xl">
          {/* Header */}
          <h1 className="text-2xl font-bold text-text-primary">Saved Results</h1>
          <p className="text-sm text-text-secondary mt-1">
            Your bookmarked search results
          </p>

          {/* Filter tabs */}
          {savedResults.length > 0 && (
            <div className="flex gap-1 mt-6 overflow-x-auto">
              {FILTER_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    filter === key
                      ? 'bg-primary text-white'
                      : 'text-text-secondary bg-surface-secondary hover:bg-border-subtle hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="mt-6">
            {savedResults.length === 0 ? (
              <EmptyState
                title="No saved results yet"
                description="Search the web and save interesting findings to access them later."
                actionLabel="Start searching"
                actionTo="/"
                icon={
                  <svg className="w-16 h-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={`No saved ${filter} results`}
                description="Try a different filter or save more results."
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-start gap-4 p-4 rounded-xl border border-border-subtle hover:border-border transition-colors"
                  >
                    {/* Thumbnail for images/videos/news */}
                    {(item.type === 'image' || item.type === 'video' || item.type === 'news') && item.thumbnail && (
                      <a
                        href={item.original || item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <img
                          src={item.thumbnail}
                          alt=""
                          className={`rounded-lg object-cover ${
                            item.type === 'image' ? 'w-20 h-20' : 'w-28 h-16'
                          }`}
                          loading="lazy"
                        />
                      </a>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={item.link || item.original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
                      >
                        {item.title || 'Untitled'}
                      </a>
                      {item.link && (
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {extractDomain(item.link)}
                        </p>
                      )}
                      {item.snippet && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                          {truncateText(item.snippet, 100)}
                        </p>
                      )}
                      <span className="inline-block mt-1.5 text-[11px] text-text-muted capitalize bg-surface-secondary px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeResult(item.id)}
                      className="shrink-0 p-2 text-text-muted hover:text-danger transition-colors rounded-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Remove "${item.title}" from saved`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
