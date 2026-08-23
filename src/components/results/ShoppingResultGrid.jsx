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
          className="group flex flex-col h-full bg-white rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] ring-1 ring-border-subtle/50 hover:ring-border-subtle overflow-hidden relative"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Floating Save Button */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <SaveButton result={result} type="shopping" size="sm" />
          </div>

          <a
            href={result.product_link || result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {/* Image Container */}
            <div className="relative aspect-square p-6 bg-[#F8F9FA] flex items-center justify-center overflow-hidden">
              <img
                src={result.thumbnail}
                alt={result.title}
                loading="lazy"
                className="max-w-full max-h-full object-contain mix-blend-darken transition-transform duration-700 ease-out group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-sm font-medium text-text-primary leading-relaxed line-clamp-2 group-hover:text-accent transition-colors duration-300 mb-3">
                {result.title}
              </h3>
              
              <div className="mt-auto flex flex-col items-start space-y-1">
                {result.price && (
                  <p className="text-xl font-bold text-text-primary tracking-tight">
                    {result.price}
                  </p>
                )}
                
                {result.source && (
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">
                    {result.source}
                  </p>
                )}

                {result.rating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center text-[#F59E0B]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-semibold ml-1 text-text-primary">{result.rating}</span>
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
