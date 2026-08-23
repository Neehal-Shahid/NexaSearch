import SaveButton from '../ui/SaveButton';

export default function ShoppingResultGrid({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2 pb-4 border-b border-border-subtle">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Top Products</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {results.map((result, index) => (
        <article 
          key={index} 
          className="group flex flex-col h-full bg-white rounded-[1.5rem] transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-border-subtle/40 hover:ring-border overflow-hidden relative"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Floating Save Button */}
          <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <SaveButton result={result} type="shopping" size="md" />
          </div>

          <a
            href={result.product_link || result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {/* Image Container with strong parallax & color shift */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#F1F5F9] flex items-center justify-center p-8 transition-colors duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-[#E2E8F0]">
              {/* Subtle vignette/gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
              
              <img
                src={result.thumbnail}
                alt={result.title}
                loading="lazy"
                className="relative z-20 max-w-full max-h-full object-contain mix-blend-darken transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.2] group-hover:-rotate-3 group-hover:-translate-y-2 shadow-black/5"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1 bg-white relative z-20 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]">
              <h3 className="text-sm font-semibold text-text-primary leading-relaxed line-clamp-2 transition-colors duration-300 group-hover:text-accent mb-4">
                {result.title}
              </h3>
              
              <div className="mt-auto flex flex-col items-start space-y-1.5">
                {result.price && (
                  <p className="text-2xl font-black text-text-primary tracking-tighter">
                    {result.price}
                  </p>
                )}
                
                {result.source && (
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] truncate">
                    {result.source}
                  </p>
                )}

                {result.rating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center text-[#F59E0B]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold ml-1.5 text-text-primary">{result.rating}</span>
                    </div>
                    {result.reviews && (
                      <span className="text-[10px] font-medium text-text-muted">({result.reviews})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </a>
        </article>
      ))}
      </div>
    </div>
  );
}
