import { useSearchParams } from 'react-router-dom';

export default function Pagination({ hasNext, className = '' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const goToPage = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage <= 1 && !hasNext) return null;

  return (
    <nav
      className={`flex items-center justify-center gap-3 py-8 ${className}`}
      aria-label="Search results pagination"
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border border-border text-text-primary bg-white transition-all duration-200 hover:bg-surface-secondary hover:border-text-muted disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      <span className="px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-secondary rounded-lg min-w-[3rem] text-center">
        {currentPage}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasNext}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border border-border text-text-primary bg-white transition-all duration-200 hover:bg-surface-secondary hover:border-text-muted disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
