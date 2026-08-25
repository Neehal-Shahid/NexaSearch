import { formatDuration, truncateText } from '../../utils/formatters';
import SaveButton from '../ui/SaveButton';

// SerpAPI's own video thumbnails are tiny (verified: ~148x83px for a
// standard result) — fine as a small grid tile, but visibly blurry once
// stretched to fill a larger card. Most video results are YouTube links, so
// pull YouTube's own higher-res thumbnail directly instead. `sddefault`
// (640x480) is used first rather than `maxresdefault`: YouTube silently
// returns a small gray placeholder with HTTP 200 (not an error) for videos
// that never generated a maxres thumbnail, which an onError fallback can't
// detect — sddefault is reliably the real image.
function extractYouTubeId(link) {
  if (!link) return null;
  const match = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function VideoResultCard({ result, variant = 'default' }) {
  const fallbackThumbnail = result.thumbnail?.static || result.thumbnail;
  const youtubeId = extractYouTubeId(result.link);
  const initialThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg` : fallbackThumbnail;
  const isInline = variant === 'inline';
  const isFeatured = variant === 'featured';

  const handleThumbnailError = (e) => {
    if (youtubeId && e.target.src.includes('sddefault')) {
      e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    } else if (fallbackThumbnail && e.target.src !== fallbackThumbnail) {
      e.target.src = fallbackThumbnail;
    } else {
      e.target.style.display = 'none';
    }
  };

  if (isFeatured) {
    return (
      <article className="group relative">
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center focus-visible:outline-none"
        >
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-500 ease-out group-hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)]">
            {initialThumbnail && (
              <img
                src={initialThumbnail}
                alt={result.title || 'Video thumbnail'}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                onError={handleThumbnailError}
              />
            )}
            {result.duration && (
              <span className="absolute bottom-3 right-3 px-2 py-1 text-[10px] tracking-wider font-bold text-white bg-black/75 rounded-md backdrop-blur-sm">
                {formatDuration(result.duration)}
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <svg className="w-7 h-7 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              {result.channel && (
                <span className="text-xs font-semibold text-accent uppercase tracking-wide truncate">{result.channel}</span>
              )}
              {result.date && (
                <>
                  <span className="w-1 h-1 rounded-full bg-text-muted shrink-0" />
                  <span className="text-xs text-text-muted shrink-0">{result.date}</span>
                </>
              )}
            </div>
            <h3 className="text-2xl font-bold text-text-primary leading-tight group-hover:text-accent transition-colors duration-200">
              {result.title}
            </h3>
            {result.snippet && (
              <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3">
                {truncateText(result.snippet, 180)}
              </p>
            )}
          </div>
        </a>
        <div className="absolute top-3 right-3 sm:top-0 sm:right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SaveButton result={result} type="video" size="sm" />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-none"
      >
        {/* Borderless tile — elevation on hover (shadow + lift) instead of a
            bordered box, so the thumbnail reads as artwork, not a form field. */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out group-hover:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.18)] group-hover:-translate-y-1">
          {initialThumbnail && (
            <img
              src={initialThumbnail}
              alt={result.title || 'Video thumbnail'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              onError={handleThumbnailError}
            />
          )}

          {/* Duration */}
          {(result.duration || result.length) && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-1 text-[10px] tracking-wider font-bold text-white bg-black/75 rounded-md backdrop-blur-sm">
              {formatDuration(result.duration || result.length)}
            </span>
          )}

          {/* Play affordance */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/95 shadow-lg">
              <svg className="w-5 h-5 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>

          {!isInline && (
            <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <SaveButton result={result} type="video" size="sm" />
            </div>
          )}
        </div>

        {/* Caption sits below the tile as calm text, not another boxed section */}
        <div className="mt-3">
          <h3 className={`font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200 ${isInline ? 'text-sm' : 'text-[15px]'}`}>
            {result.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            {result.channel && (
              <span className="text-xs font-medium text-text-muted truncate">{result.channel}</span>
            )}
            {result.date && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-text-muted shrink-0" />
                <span className="text-xs text-text-muted shrink-0">{result.date}</span>
              </>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
