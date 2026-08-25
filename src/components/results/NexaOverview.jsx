import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// SerpAPI's ai_overview text/list fields are sometimes objects (e.g.
// { text, snippet, title }) instead of plain strings. Stringifying one
// directly (`${value}`) silently produces the literal text "[object
// Object]" instead of throwing — so every place that reads these fields
// needs this normalization, not just the ones that happen to crash.
function toPlainText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.text || value.snippet || value.title || '';
  return String(value);
}

export default function NexaOverview({ data, searchContext = '', query }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!data) return null;

  const blocks = Array.isArray(data.text_blocks) 
    ? data.text_blocks 
    : (typeof data === 'string' ? [{ snippet: data }] : []);

  if (blocks.length === 0) return null;

  const displayBlocks = isExpanded ? blocks : blocks.slice(0, 2);
  const hasMore = blocks.length > 2;

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const initialText = blocks.map(b => {
      const title = toPlainText(b.title);
      const snippet = toPlainText(b.snippet);
      let text = title ? `**${title}**\n` : '';
      if (snippet) text += `${snippet}\n`;
      if (b.list && Array.isArray(b.list)) {
        text += b.list.map(toPlainText).filter(Boolean).map(item => `- ${item}`).join('\n');
      }
      return text.trim();
    }).filter(Boolean).join('\n\n');
    
    // Redirect to AI tab and pass initial context and user question
    navigate(`/search?q=${encodeURIComponent(query || searchParams.get('q'))}&type=ai`, {
      state: {
        chatHistory: [
          { role: 'model', content: initialText },
          { role: 'user', content: userMessage }
        ]
      }
    });
  };

  return (
    <div className="relative mb-10 rounded-2xl bg-white shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-border overflow-hidden flex flex-col">
      <div className="relative p-6 sm:p-8 z-10 flex-1">
        <div className="flex items-center gap-3 mb-6 pb-4">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-text-primary">Overview</h2>
        </div>

        <div className="space-y-5">
          {displayBlocks.map((block, index) => {
            // SerpAPI's text_blocks array can contain null/non-object entries
            // (e.g. sparse arrays, reference blocks with an unexpected shape).
            // These only surface once "Read full overview" reveals blocks past
            // index 1, so this guard must live here, not just at the array level.
            if (!block || typeof block !== 'object') return null;

            // Basic markdown formatter
            const formatText = (text) => {
              const str = toPlainText(text);
              if (!str) return '';

              return str
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-surface-secondary px-1.5 py-0.5 rounded text-sm font-mono text-accent">$1</code>');
            };

            return (
              <div key={index} className="animate-in fade-in duration-500">
                {block.title && <h3 className="text-lg font-semibold text-text-primary mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: formatText(block.title) }} />}
                
                {block.snippet && (
                  <p 
                    className="text-[15px] text-text-secondary leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatText(block.snippet) }}
                  />
                )}
                
                {block.list && Array.isArray(block.list) && (
                  <ul className="list-disc pl-5 mt-3 space-y-1.5">
                    {block.list.map((item, i) => (
                      <li 
                        key={i} 
                        className="text-[15px] text-text-secondary leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatText(item) }}
                      />
                    ))}
                  </ul>
                )}
                
                {/* Code Blocks */}
                {block.code && (
                  <pre className="bg-surface-secondary border border-border-subtle p-4 rounded-xl mt-3 overflow-x-auto text-sm font-mono text-text-secondary shadow-sm">
                    <code>{typeof block.code === 'string' ? block.code : JSON.stringify(block.code, null, 2)}</code>
                  </pre>
                )}
                
                {/* Links */}
                {block.link && (
                  <div className="mt-3">
                    <a href={block.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                      {typeof block.link_title === 'string' ? block.link_title : (typeof block.title === 'string' ? block.title : 'View reference')}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {/* Global Media for AI Overview */}
          {(data.videos || data.images) && (
            <div className="mt-6 pt-4 border-t border-border-subtle flex flex-wrap gap-4">
              {Array.isArray(data.videos) && data.videos.filter(Boolean).slice(0, 2).map((vid, i) => (
                <a key={`vid-${i}`} href={vid.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 pr-5 rounded-xl border border-border-subtle hover:bg-surface-secondary transition-colors group max-w-sm">
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                    <svg className="w-6 h-6 text-red-500 pl-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-text-primary truncate">{typeof vid.title === 'string' ? vid.title : 'Watch Video'}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {typeof vid.duration === 'string' ? `${vid.duration} • ` : ''}{typeof vid.source === 'string' ? vid.source : 'YouTube'}
                    </p>
                  </div>
                </a>
              ))}
              {Array.isArray(data.images) && data.images.filter(Boolean).slice(0, 3).map((img, i) => (
                <a key={`img-${i}`} href={img.link} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-xl overflow-hidden border border-border-subtle hover:opacity-80 transition-opacity">
                  <img src={img.thumbnail || img.link} alt="AI Reference" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>

        {hasMore && !isExpanded && (
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent bg-accent-light/50 hover:bg-accent-light rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Read full overview
              <svg className="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="bg-surface-secondary border-t border-border-subtle p-4 sm:px-8 shrink-0">
        <form onSubmit={handleSendMessage} className="relative flex items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow up..."
            className="w-full bg-white border border-border-subtle rounded-full py-3.5 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-sm text-text-primary placeholder:text-text-muted transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2 rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          >
            <svg className="w-4 h-4 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
