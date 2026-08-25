import { useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Logo from '../components/ui/Logo';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About — Nexa Search';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="flex-1">
      <PageContainer className="py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-text-secondary text-lg">
              A modern search & discovery platform
            </p>
          </div>

          {/* About content */}
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-2">About Nexa</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Nexa is a modern web search and discovery application built as a portfolio project.
                It demonstrates real-world React architecture, API integration, state management,
                and responsive design — all wrapped in a clean, professional interface.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Features</h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Web, Image, News, and Video search across multiple result types
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Save and bookmark interesting results for later
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Search history with easy access to previous searches
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  URL-driven state for shareable search links
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Responsive design optimized for mobile, tablet, and desktop
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'Vite', 'Tailwind CSS', 'React Router', 'SerpAPI', 'Vercel'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface-secondary rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted leading-relaxed">
                This is a portfolio project and is not affiliated with Google or any search engine.
                Search results are provided by{' '}
                <a
                  href="https://serpapi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover transition-colors"
                >
                  SerpAPI
                </a>
                . Built with care to demonstrate professional frontend development skills.
              </p>
            </section>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
