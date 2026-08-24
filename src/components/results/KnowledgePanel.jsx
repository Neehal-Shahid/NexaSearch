export default function KnowledgePanel({ data }) {
  if (!data) return null;

  return (
    <aside className="rounded-xl border border-border-subtle p-5 space-y-4 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header image */}
      {data.header_images?.[0]?.image && (
        <div className="overflow-hidden rounded-lg aspect-video bg-surface-secondary">
          <img
            src={data.header_images[0].image}
            alt={data.title || ''}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Title and type */}
      <div>
        <h3 className="text-xl font-bold text-text-primary tracking-tight leading-tight">{data.title}</h3>
        {data.type && (
          <p className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wider">{data.type}</p>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {typeof data.description === 'string' ? data.description : data.description.text || ''}
        </p>
      )}

      {/* Key facts */}
      {data.facts && Object.keys(data.facts).length > 0 && (
        <dl className="space-y-3 pt-4 border-t border-border-subtle">
          {Object.entries(data.facts).slice(0, 6).map(([key, value]) => (
            <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm">
              <dt className="text-text-muted font-medium shrink-0 sm:w-24 capitalize">{key}</dt>
              <dd className="text-text-primary font-medium">{typeof value === 'object' ? value?.name || JSON.stringify(value) : value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Source link */}
      {data.source?.link && (
        <div className="pt-4 mt-2 border-t border-border-subtle">
          <a
            href={data.source.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline transition-all"
          >
            Source: {data.source.name || 'Wikipedia'}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      )}
    </aside>
  );
}
