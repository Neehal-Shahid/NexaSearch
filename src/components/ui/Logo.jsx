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
      className={`inline-flex items-center gap-2.5 font-black tracking-tighter no-underline select-none ${sizes[size]} ${className}`}
      aria-label="Nexa — Home"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-6 h-6' : 'w-5 h-5'}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="url(#brand-gradient)" />
        <path
          d="M9 24V8l7 8 7-8v16"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="brand-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A1A2D" />
            <stop offset="0.1" stopColor="#162A45" />
            <stop offset="1" stopColor="#2A5EE8" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-brand-gradient">NEXA</span>
    </Link>
  );
}
