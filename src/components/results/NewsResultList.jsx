import NewsResultCard from './NewsResultCard';

export default function NewsResultList({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {results.map((result, index) => (
        <NewsResultCard key={result.link || index} result={result} />
      ))}
    </div>
  );
}
