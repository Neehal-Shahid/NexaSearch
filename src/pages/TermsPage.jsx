import { useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Logo from '../components/ui/Logo';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service — Nexa Search';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="flex-1 bg-background">
      <PageContainer className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Logo size="lg" className="mb-6" />
            <h1 className="text-3xl font-bold text-text-primary mb-4">Terms of Service</h1>
            <p className="text-sm text-text-muted">Last Updated: August 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-[15px] text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Nexa Search, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">2. Nature of the Service</h2>
              <p>
                Nexa Search is a demonstration portfolio project built to showcase frontend engineering, API integration, and modern web design principles. It is not intended to be a commercial search engine or a replacement for services like Google Search. 
              </p>
              <p className="mt-3">
                All search results, knowledge panels, and AI overviews are fetched dynamically from third-party APIs (such as SerpApi and Google Gemini). Nexa Search does not claim ownership or accuracy over any of the content displayed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">3. Acceptable Use</h2>
              <p className="mb-3">
                When using Nexa Search, you agree not to:
              </p>
              <ul className="list-disc ml-5 space-y-2">
                <li>Automate requests, scrape, or otherwise abuse the search functionality in a way that exhausts our API quotas.</li>
                <li>Use the platform for any illegal, harmful, or malicious activities.</li>
                <li>Attempt to bypass or manipulate the backend serverless functions or proxy architecture.</li>
              </ul>
              <p className="mt-3">
                Due to the free-tier limitations of our underlying API providers (SerpApi), search functionality may become temporarily unavailable if monthly quotas are exceeded.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">4. Disclaimer of Warranties</h2>
              <p>
                Nexa Search is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, express or implied. We do not guarantee the accuracy, completeness, or reliability of any search results, AI-generated answers, or translations. Use the information provided at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">5. Modifications</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the Nexa Search platform (or any part of it) at any time without notice, primarily because it is a portfolio project subject to ongoing development and API restrictions.
              </p>
            </section>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
