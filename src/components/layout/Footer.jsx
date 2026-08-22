import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-text-primary tracking-tight">NEXA</p>
            <p className="text-xs text-text-muted mt-0.5">
              A modern search & discovery platform
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-4 text-xs text-text-secondary" aria-label="Footer navigation">
            <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
            <Link to="/saved" className="hover:text-text-primary transition-colors">Saved</Link>
            <Link to="/history" className="hover:text-text-primary transition-colors">History</Link>
            <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
          </nav>

          {/* Attribution */}
          <div className="text-center md:text-right">
            <p className="text-xs text-text-muted">
              Powered by{' '}
              <a
                href="https://serpapi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors"
              >
                SerpAPI
              </a>
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Portfolio project — not affiliated with Google
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
