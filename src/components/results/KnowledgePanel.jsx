// SerpAPI's real Google Knowledge Graph responses don't wrap facts in a
// generic `facts` object — they expose them as dynamic top-level fields
// specific to the entity type (e.g. born/died/spouse/children for a person,
// founded/headquarters/ceo for a company), each paired with a "..._links"
// array holding the hyperlinked version of the same fact. `data.facts` is
// kept as a fallback in case a future SerpAPI response ever does provide it
// directly, but for real responses this list is what actually renders.
const KNOWLEDGE_GRAPH_META_KEYS = new Set([
  'title', 'type', 'entity_type', 'kgmid', 'knowledge_graph_search_link',
  'serpapi_knowledge_graph_search_link', 'header_images', 'description',
  'description_highlighted_words', 'source', 'sources', 'thumbnail', 'image',
  'website', 'tabs', 'main_tab_text', 'people_also_search_for',
  'people_also_search_for_link', 'people_also_search_for_stick', 'web_results',
  'facts',
]);

function extractFacts(data) {
  if (data.facts && typeof data.facts === 'object') {
    return Object.entries(data.facts);
  }

  return Object.entries(data).filter(([key, value]) => {
    if (KNOWLEDGE_GRAPH_META_KEYS.has(key)) return false;
    if (key.endsWith('_link') || key.endsWith('_links')) return false;
    if (value == null || Array.isArray(value)) return false;
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'object';
  });
}

function formatFactLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function KnowledgePanel({ data }) {
  if (!data) return null;

  const facts = extractFacts(data);

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
      {facts.length > 0 && (
        <dl className="space-y-3 pt-4 border-t border-border-subtle">
          {facts.slice(0, 6).map(([key, value]) => (
            <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm">
              <dt className="text-text-muted font-medium shrink-0 sm:w-24">{formatFactLabel(key)}</dt>
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
