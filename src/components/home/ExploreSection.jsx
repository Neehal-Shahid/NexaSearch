import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const EXPLORE_TOPICS_POOL = [
  { category: 'Technology', title: 'What is changing next?', query: 'future of technology trends' },
  { category: 'Design', title: 'Ideas shaping the web.', query: 'modern web design trends' },
  { category: 'Science', title: 'Understand the world.', query: 'recent scientific discoveries' },
  { category: 'Business', title: 'What\'s moving markets?', query: 'global market trends' },
  { category: 'Culture', title: 'Evolution of cinema.', query: 'evolution of global cinema' },
  { category: 'Environment', title: 'Sustainable futures.', query: 'sustainable energy solutions' },
  { category: 'Health', title: 'The science of longevity.', query: 'longevity and biotechnology advancements' },
  { category: 'Philosophy', title: 'Ethics in the AI era.', query: 'ethics of artificial intelligence' },
  { category: 'Space', title: 'Beyond our solar system.', query: 'James webb space telescope findings' },
  { category: 'Architecture', title: 'Minimalism in spaces.', query: 'minimalist architecture modern' },
  { category: 'Economy', title: 'Startups disrupting norms.', query: 'startups disrupting traditional industries' },
  { category: 'History', title: 'Lost ancient cities.', query: 'recent archaeological discoveries ancient cities' },
];

export default function ExploreSection() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    // Randomly shuffle the pool and pick the top 4
    const shuffled = [...EXPLORE_TOPICS_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4).map((topic, index) => ({
      ...topic,
      id: `0${index + 1}`
    }));
    setTopics(selected);
  }, []);

  const handleTopicClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=web&page=1`);
  };

  if (topics.length === 0) return null;

  return (
    <section className="w-full mt-24">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-6">Explore</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic.query)}
            className="group flex flex-col items-start p-6 rounded-2xl bg-surface hover:bg-primary hover:text-white hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 border border-border hover:border-transparent transition-all duration-300 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="text-xs font-bold opacity-60 mb-4">{topic.id}</span>
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
