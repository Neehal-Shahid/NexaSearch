import { useState } from 'react';
import { truncateText } from '../../utils/formatters';

function PAAItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border-subtle last:border-0 bg-white hover:bg-surface-secondary transition-colors duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-text-primary">{item.question}</span>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="pb-4 px-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {item.snippet}
          </p>
          {item.link && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Source:</span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors truncate"
              >
                {item.title || item.displayed_link || item.link}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PeopleAlsoAsk({ questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t border-border-subtle">
      <h3 className="text-lg font-semibold text-text-primary mb-4">People also ask</h3>
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {questions.map((item, index) => (
          <PAAItem key={index} item={item} />
        ))}
      </div>
    </section>
  );
}
