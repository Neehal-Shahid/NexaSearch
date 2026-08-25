import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, options, onChange, ariaLabel, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const filteredOptions = (Array.isArray(options) ? options : []).filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        className={`flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-80 w-max min-w-[200px] max-w-[280px] flex flex-col rounded-xl bg-white border border-border-subtle shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="p-2 border-b border-border-subtle shrink-0">
            <div className="relative">
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="w-full bg-surface-secondary border-none rounded-lg py-1.5 pl-8 pr-3 text-sm focus:ring-1 focus:ring-accent text-text-primary placeholder:text-text-muted"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <ul className="py-1 overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      value === option
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-text-primary hover:bg-surface-secondary'
                    }`}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-sm text-text-muted text-center">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
