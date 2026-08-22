import { useState } from 'react';

export default function NexaOverview({ data }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  // Sometimes it's a string, sometimes an array of blocks
  const blocks = Array.isArray(data.text_blocks) 
    ? data.text_blocks 
    : (typeof data === 'string' ? [{ snippet: data }] : []);

  if (blocks.length === 0) return null;

  const displayBlocks = isExpanded ? blocks : blocks.slice(0, 2);
  const hasMore = blocks.length > 2;

  return (
    <div className="bg-signature-dark text-white rounded-2xl p-6 mb-8 relative overflow-hidden shadow-lg border border-primary-hover">
      {/* Background visual element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-accent-light">Nexa Overview</h2>
        </div>

        <div className="space-y-4">
          {displayBlocks.map((block, index) => (
            <div key={index}>
              {block.title && <h3 className="text-lg font-medium text-white mb-2">{block.title}</h3>}
              <p className="text-base text-gray-300 leading-relaxed">
                {block.snippet}
              </p>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 flex items-center gap-2 text-sm font-medium text-accent-light hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light rounded-sm"
          >
            {isExpanded ? 'Show less' : 'Show more'}
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
