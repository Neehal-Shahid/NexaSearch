import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-4xl md:text-5xl',
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight no-underline select-none ${sizes[size]} ${className}`}
      aria-label="Nexa — Home"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-6 h-6' : 'w-5 h-5'}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="currentColor" className="text-accent" />
        <circle cx="14" cy="14" r="6" stroke="white" strokeWidth="2.5" />
        <path
          d="M18.24 18.24L24 24"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-text-primary">NEXA</span>
    </Link>
  );
}
