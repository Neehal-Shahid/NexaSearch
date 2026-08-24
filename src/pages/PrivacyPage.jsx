import { useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Logo from '../components/ui/Logo';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Nexa Search';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="flex-1 bg-background">
      <PageContainer className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Logo size="lg" className="mb-6" />
            <h1 className="text-3xl font-bold text-text-primary mb-4">Privacy Policy</h1>
            <p className="text-sm text-text-muted">Last Updated: August 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-[15px] text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">1. Introduction</h2>
              <p>
                Welcome to Nexa Search. This Privacy Policy explains how we collect, use, and protect your information when you use our search engine and related services. Since Nexa is built primarily as a portfolio project, our data practices are incredibly minimal and privacy-focused by design.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">2. Data Collection & Usage</h2>
              <p className="mb-3">
                <strong>Search Queries:</strong> When you use Nexa, your search queries are sent to our backend APIs (powered by SerpApi and Google Gemini) to retrieve relevant results and AI-generated overviews.
              </p>
              <p className="mb-3">
                <strong>Local Storage:</strong> To enhance your experience, we use your browser's local storage to save your search history and bookmarked collections. This data remains entirely on your device and is never transmitted to our servers for analytics, tracking, or advertising.
              </p>
              <p>
                <strong>Location Data:</strong> If you perform local searches, our serverless backend temporarily reads your IP-based geolocation headers (provided automatically by Vercel) to return accurate local results (e.g., the Local Map Pack). This data is processed in real-time and is not stored.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">3. Third-Party Services</h2>
              <p className="mb-3">
                We rely on third-party service providers to power the core functionality of Nexa:
              </p>
              <ul className="list-disc ml-5 space-y-2">
                <li><strong>SerpApi:</strong> Used to fetch search engine results, images, news, and videos.</li>
                <li><strong>Google Gemini:</strong> Used to power the Nexa AI overview and translation features.</li>
                <li><strong>Vercel:</strong> Used to host our frontend and serverless backend functions.</li>
              </ul>
              <p className="mt-3">
                Please refer to the respective privacy policies of these third parties to understand how they handle data transmitted through their APIs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">4. Cookies and Tracking</h2>
              <p>
                Nexa Search does not use tracking cookies, analytics pixels, or ad retargeting mechanisms. We believe search should be private. Any essential "cookies" or tokens used are strictly for maintaining basic application state or API rate limiting.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">5. Contact Information</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or the Nexa Search portfolio project, please feel free to reach out to the developer through the associated GitHub repository or professional portfolio.
              </p>
            </section>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
