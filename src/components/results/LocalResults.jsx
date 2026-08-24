export default function LocalResults({ results, map }) {
  if ((!results || results.length === 0) && !map) return null;

  return (
    <div className="mb-10 bg-white border border-border-subtle rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <h2 className="text-base font-semibold text-text-primary">Local Places</h2>
      </div>

      {map && map.image && (
        <a href={map.link || '#'} target="_blank" rel="noopener noreferrer" className="block mb-5 rounded-xl overflow-hidden border border-border-subtle bg-surface-secondary group relative">
          <img src={map.image} alt="Map of local results" className="w-full h-40 md:h-56 object-cover object-center group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-text-primary shadow-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
            View on Maps
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </a>
      )}

      {results && results.length > 0 && (
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {results.map((place, index) => (
          <a
            key={index}
            href={place.links?.directions || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title + ' ' + (place.address || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-shrink-0 w-72 flex flex-col bg-surface hover:bg-surface-secondary border border-border-subtle rounded-xl overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {place.thumbnail ? (
              <div className="h-32 w-full overflow-hidden bg-surface-secondary">
                <img
                  src={place.thumbnail}
                  alt={place.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="h-32 w-full bg-surface-secondary flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
            
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-base font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors truncate">
                {place.title}
              </h3>
              
              {(place.rating || place.reviews) && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {place.rating && (
                    <>
                      <span className="text-sm font-bold text-text-primary">{place.rating}</span>
                      <svg className="w-3.5 h-3.5 text-[#F59E0B] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </>
                  )}
                  {place.reviews && (
                    <span className="text-xs text-text-muted">({place.reviews})</span>
                  )}
                  {place.price && (
                    <>
                      <span className="text-border mx-1">•</span>
                      <span className="text-xs text-text-secondary font-medium">{place.price}</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="mt-2 text-xs text-text-secondary space-y-1">
                {(place.type || place.address) && (
                  <p className="truncate">
                    {place.type ? `${place.type} ` : ''}
                    {place.type && place.address ? '• ' : ''}
                    {place.address}
                  </p>
                )}
                {place.hours && (
                  <p className={place.hours.includes('Closed') ? 'text-red-600' : 'text-emerald-600'}>
                    {place.hours}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
        </div>
      )}
    </div>
  );
}
