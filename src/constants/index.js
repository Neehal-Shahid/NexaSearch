// Search type constants
export const SEARCH_TYPES = {
  WEB: 'web',
  AI: 'ai',
  IMAGES: 'images',
  NEWS: 'news',
  VIDEOS: 'videos',
  SHOPPING: 'shopping',
};

// Tab configuration for SearchTabs component
export const SEARCH_TABS = [
  { key: SEARCH_TYPES.AI, label: 'AI Mode' },
  { key: SEARCH_TYPES.WEB, label: 'All' },
  { key: SEARCH_TYPES.IMAGES, label: 'Images' },
  { key: SEARCH_TYPES.VIDEOS, label: 'Videos' },
  { key: SEARCH_TYPES.NEWS, label: 'News' },
  { key: SEARCH_TYPES.SHOPPING, label: 'Shopping' },
];

// Trending searches displayed on the homepage
export const TRENDING_SEARCHES = [
  'Artificial Intelligence',
  'React 19',
  'Web Design Trends',
  'Space Exploration',
  'Startups',
  'Machine Learning',
  'Climate Technology',
  'Cybersecurity',
];

// Search history configuration
export const HISTORY_MAX_ITEMS = 50;

// Saved results configuration
export const SAVED_STORAGE_KEY = 'nexa_saved_results';
export const HISTORY_STORAGE_KEY = 'nexa_search_history';

// Results per page
export const RESULTS_PER_PAGE = 10;
