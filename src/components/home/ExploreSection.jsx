import { useNavigate } from 'react-router-dom';

const EXPLORE_TOPICS = [
  {
    id: '01',
    category: 'Technology',
    title: 'What is changing next?',
    query: 'future of technology trends',
  },
  {
    id: '02',
    category: 'Design',
    title: 'Ideas shaping the web.',
    query: 'modern web design trends',
  },
  {
    id: '03',
    category: 'Science',
    title: 'Understand the world.',
    query: 'recent scientific discoveries',
  },
  {
    id: '04',
    category: 'Business',
    title: 'What\'s moving markets?',
    query: 'global market trends',
  },
];

export default function ExploreSection() {
  const navigate = useNavigate();

  const handleTopicClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=web&page=1`);
  };

  return (
    <section className="w-full mt-24">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-6">Explore</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPLORE_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic.query)}
            className="group flex flex-col items-start p-6 rounded-2xl bg-surface hover:bg-signature-dark hover:text-white border border-border transition-all duration-300 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="text-xs font-medium opacity-50 mb-4">{topic.id}</span>
            <span className="text-sm font-semibold uppercase tracking-wider mb-1">{topic.category}</span>
            <div className="w-full flex items-center justify-between">
              <span className="text-lg font-medium">{topic.title}</span>
              <svg 
                className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
