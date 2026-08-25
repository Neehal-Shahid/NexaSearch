import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { SavedResultsProvider } from './context/SavedResultsContext';
import { SearchHistoryProvider } from './context/SearchHistoryContext';
import HomePage from './pages/HomePage';
import CommandPalette from './components/search/CommandPalette';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy-load secondary pages for smaller initial bundle
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-text-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}

function AppRoutes() {
  // Keying the boundary to the route means a crash on one page doesn't
  // strand the user on a blank screen forever — navigating anywhere else
  // (via Header/CommandPalette, which render outside this boundary) clears
  // the error automatically, no manual reload required.
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname + location.search}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SearchHistoryProvider>
        <SavedResultsProvider>
          {/* Skip to content link */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="min-h-screen flex flex-col" id="main-content">
            <CommandPalette />
            <Header />

            <AppRoutes />

            <Footer />
          </div>
        </SavedResultsProvider>
      </SearchHistoryProvider>
    </BrowserRouter>
  );
}
