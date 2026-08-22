import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo, icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon ? (
        <div className="mb-5 text-text-muted">{icon}</div>
      ) : (
        <div className="mb-5">
          <svg className="w-16 h-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
