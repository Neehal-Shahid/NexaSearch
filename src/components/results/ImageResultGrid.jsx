import { useState } from 'react';
import ImageResultCard from './ImageResultCard';
import ImagePreviewModal from './ImagePreviewModal';

export default function ImageResultGrid({ results, variant = 'default' }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!results || results.length === 0) return null;

  return (
    <>
      <div className={variant === 'inline' ? "grid grid-cols-2 sm:grid-cols-4 gap-4" : "image-masonry"}>
        {results.map((result, index) => (
          <ImageResultCard 
            key={result.original || result.thumbnail || index} 
            result={result} 
            onClick={() => setSelectedIndex(index)}
            variant={variant}
          />
        ))}
      </div>

      {selectedIndex !== null && (
        <ImagePreviewModal
          results={results}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
