import { useState } from 'react';

export default function NexaOverview({ data }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  const blocks = Array.isArray(data.text_blocks) 
    ? data.text_blocks 
    : (typeof data === 'string' ? [{ snippet: data }] : []);

  if (blocks.length === 0) return null;

  const displayBlocks = isExpanded ? blocks : blocks.slice(0, 2);
  const hasMore = blocks.length > 2;

  return (
    <div className="relative mb-8 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border overflow-hidden">
      {/* Animated gradient top border */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-gradient animate-gradient-x" />
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2A5EE8]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
      
      <div className="relative p-6 sm:p-8 z-10">
        <div className="flex items-center gap-3 mb-6 border-b border-border-subtle pb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 border border-blue-200/50 shadow-sm">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold tracking-widest uppercase text-text-primary">Nexa AI Overview</h2>
        </div>

        <div className="space-y-5">
          {displayBlocks.map((block, index) => (
            <div key={index} className="animate-in fade-in duration-500">
              {block.title && <h3 className="text-lg font-semibold text-text-primary mb-2 leading-tight">{block.title}</h3>}
              <p className="text-[15px] text-text-secondary leading-relaxed">
                {block.snippet}
              </p>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent bg-accent-light/50 hover:bg-accent-light rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isExpanded ? 'Show less' : 'Read full overview'}
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
