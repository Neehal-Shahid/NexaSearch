import SaveButton from '../ui/SaveButton';

export default function ImageResultCard({ result, onClick }) {
  const imageUrl = result.thumbnail || result.original;

  return (
    <div className="group relative rounded-lg overflow-hidden bg-surface-secondary">
      <button
        onClick={onClick}
        type="button"
        className="w-full text-left block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset cursor-zoom-in"
      >
        <img
          src={imageUrl}
          alt={result.title || 'Search result image'}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            e.target.parentElement.parentElement.style.display = 'none';
          }}
        />
      </button>

      {/* Overlay with info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
