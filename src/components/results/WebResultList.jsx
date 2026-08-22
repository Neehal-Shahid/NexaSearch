import WebResultItem from './WebResultItem';

export default function WebResultList({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="divide-y divide-border-subtle">
      {results.map((result, index) => (
        <WebResultItem key={result.link || index} result={result} />
      ))}
    </div>
  );
}
