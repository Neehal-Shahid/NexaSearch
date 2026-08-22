import { useState } from 'react';
import ImageResultCard from './ImageResultCard';
import ImagePreviewModal from './ImagePreviewModal';

export default function ImageResultGrid({ results }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!results || results.length === 0) return null;

  return (
    <>
      <div className="image-masonry">
        {results.map((result, index) => (
          <ImageResultCard 
            key={result.original || result.thumbnail || index} 
            result={result} 
            onClick={() => setSelectedIndex(index)}
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
