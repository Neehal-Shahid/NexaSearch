import { useSavedResults } from '../../context/SavedResultsContext';

export default function SaveButton({ result, type, size = 'md' }) {
  const { isResultSaved, saveResult, removeResult, savedResults } = useSavedResults();
  const saved = isResultSaved(result.link, type);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (saved) {
      const savedItem = savedResults.find(
        (item) => item.link === result.link && item.type === type
      );
      if (savedItem) removeResult(savedItem.id);
    } else {
      saveResult({ ...result, type });
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        size === 'sm' ? 'p-1.5' : 'p-2'
      } ${
        saved
          ? 'text-accent bg-accent-light hover:bg-blue-100'
          : 'text-text-muted hover:text-text-secondary hover:bg-surface-secondary'
      }`}
      aria-label={saved ? 'Remove from saved' : 'Save result'}
      title={saved ? 'Remove from saved' : 'Save result'}
    >
      <svg
        className={iconSize}
        fill={saved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={saved ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        />
      </svg>
    </button>
  );
}
