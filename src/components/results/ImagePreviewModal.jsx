import { useEffect, useState, useRef } from 'react';
import SaveButton from '../ui/SaveButton';
import { extractDomain } from '../../utils/formatters';

export default function ImagePreviewModal({ results, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef(null);

  const result = results[currentIndex];
  const imageUrl = result.original || result.link || result.thumbnail;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === results.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
  };

  if (!result) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
          {currentIndex + 1} / {results.length}
        </span>
        <button 
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <button 
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        className="absolute left-4 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all hover:scale-110 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Previous image"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        className="absolute right-4 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full transition-all hover:scale-110 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Next image"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Main Image */}
      <div 
        className="w-full h-full p-16 sm:p-24 flex items-center justify-center cursor-pointer"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={result.title}
          className="max-w-full max-h-full object-contain select-none cursor-default shadow-2xl rounded-sm transition-transform duration-300"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom Bar */}
      <div 
        className="absolute bottom-0 inset-x-0 p-6 sm:px-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0 pointer-events-auto">
          <h2 className="text-white text-lg sm:text-xl font-medium leading-tight truncate mb-1">
            {result.title}
          </h2>
          {result.source && (
            <p className="text-white/60 text-sm truncate flex items-center gap-2">
              <span>{result.source}</span>
              {result.link && (
                <>
                  <span>&bull;</span>
                  <span className="text-white/40 text-xs">{extractDomain(result.link)}</span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 pointer-events-auto">
          {result.link && (
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Visit Source
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          )}
          <SaveButton result={{ ...result, link: imageUrl }} type="image" />
        </div>
      </div>
    </div>
  );
}
