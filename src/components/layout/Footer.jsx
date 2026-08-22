import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border mt-auto relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Logo size="md" className="mb-4" />
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mb-6">
              A premium knowledge discovery engine designed to surface the most relevant answers, stories, and insights from across the web.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-secondary border border-border-subtle shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-text-secondary tracking-wide uppercase">All systems operational</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-text-secondary hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Search</Link></li>
                <li><Link to="/saved" className="text-sm text-text-secondary hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Collections</Link></li>
                <li><Link to="/history" className="text-sm text-text-secondary hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">History</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-text-secondary hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">About Nexa</Link></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Attribution Column */}
          <div className="md:col-span-3 flex flex-col md:items-end md:text-right text-left">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">Powered By</h4>
            <a
              href="https://serpapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border hover:shadow-sm transition-all duration-300 w-full sm:w-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-border-subtle">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">SerpAPI</p>
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Data Provider</p>
              </div>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted font-medium">
            &copy; {new Date().getFullYear()} Nexa Search. All rights reserved.
          </p>
          <p className="text-xs text-text-muted font-medium">
            Portfolio Project — Not affiliated with Google
          </p>
        </div>
      </div>
    </footer>
  );
}
