export default function KnowledgePanel({ data }) {
  if (!data) return null;

  return (
    <aside className="rounded-xl border border-border-subtle p-5 space-y-4 bg-white">
      {/* Header image */}
      {data.header_images?.[0]?.image && (
        <img
          src={data.header_images[0].image}
          alt={data.title || ''}
          className="w-full h-40 object-cover rounded-lg"
          loading="lazy"
        />
      )}

      {/* Title and type */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{data.title}</h3>
        {data.type && (
          <p className="text-xs text-text-muted mt-0.5">{data.type}</p>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-sm text-text-secondary leading-relaxed">{data.description}</p>
      )}

      {/* Key facts */}
      {data.facts && Object.keys(data.facts).length > 0 && (
        <dl className="space-y-2 pt-2 border-t border-border-subtle">
          {Object.entries(data.facts).slice(0, 6).map(([key, value]) => (
            <div key={key} className="flex gap-2 text-sm">
              <dt className="text-text-muted shrink-0 min-w-[80px]">{key}:</dt>
              <dd className="text-text-primary">{typeof value === 'object' ? value?.name || JSON.stringify(value) : value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Source link */}
      {data.source?.link && (
        <a
          href={data.source.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-accent hover:text-accent-hover mt-2"
        >
          Source: {data.source.name || 'Wikipedia'}
        </a>
      )}
    </aside>
  );
}
