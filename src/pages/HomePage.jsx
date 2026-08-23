import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import SearchBar from '../components/search/SearchBar';
import PageContainer from '../components/layout/PageContainer';
import ExploreSection from '../components/home/ExploreSection';
import SignatureVisual from '../components/ui/SignatureVisual';

export default function HomePage() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden">
      <SignatureVisual />
      
      <PageContainer className="w-full max-w-4xl py-20 flex flex-col items-center z-10">
        {/* Hero */}
        <div className="text-center mb-12 flex flex-col items-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-4 leading-tight">
            Search the world, <br className="hidden sm:block" />
            <span className="text-accent">beyond the obvious.</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-lg font-medium">
            Discover answers, stories, images, and ideas from across the web.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-2xl">
          <SearchBar variant="hero" autoFocus />
        </div>

        {/* Explore section */}
        <ExploreSection />
      </PageContainer>
    </main>
  );
}
