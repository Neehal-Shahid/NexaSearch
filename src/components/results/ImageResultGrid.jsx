import ImageResultCard from './ImageResultCard';

export default function ImageResultGrid({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="image-masonry">
      {results.map((result, index) => (
        <ImageResultCard key={result.original || result.thumbnail || index} result={result} />
      ))}
    </div>
  );
}
