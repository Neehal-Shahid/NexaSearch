import SaveButton from '../ui/SaveButton';

export default function ImageResultCard({ result, onClick, variant = 'default' }) {
  // SerpApi sometimes returns high resolution versions in `original` or `thumbnail.high_resolution` (not standard, but good to check)
  const imageUrl = result.original || result.thumbnail;
  // `original` points at whatever third-party site hosts the image — it can
  // be slow, hotlink-protected, or simply gone. `thumbnail` is Google's own
  // proxied copy and far more reliable. Previously a failed `original` load
  // hid the whole card with no fallback; now it retries once via `thumbnail`
  // before giving up, matching this app's defensive-rendering convention.
  const handleImageError = (e) => {
    if (result.original && result.thumbnail && e.target.src !== result.thumbnail) {
      e.target.src = result.thumbnail;
      return;
    }
    e.target.parentElement.parentElement.style.display = 'none';
  };

  return (
    <div className={`group relative rounded-2xl overflow-hidden bg-surface-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-500 ease-out hover:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.18)] ${variant === 'inline' ? 'aspect-[4/3]' : ''}`}>
      <button
        onClick={onClick}
        type="button"
        className={`w-full text-left block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset cursor-zoom-in ${variant === 'inline' ? 'h-full' : ''}`}
      >
        <img
          src={imageUrl}
          alt={result.title || 'Search result image'}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${variant === 'inline' ? 'h-full' : 'h-auto'}`}
          onError={handleImageError}
        />
      </button>

      {/* Overlay with info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <p className="text-white text-xs font-medium truncate">
          {result.title || result.source}
        </p>
        {result.source && (
          <p className="text-white/70 text-[11px] truncate mt-0.5">{result.source}</p>
        )}
      </div>

      {/* Save button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <SaveButton
          result={{ ...result, link: result.original || result.link }}
          type="image"
          size="sm"
        />
      </div>
    </div>
  );
}
