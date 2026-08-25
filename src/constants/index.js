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

// Per-browser feature-flag localStorage keys, set from AdminPage's
// "Local Platform Controls" and read wherever the flag applies.
// Centralized here so a typo in the key string can't silently break a flag.
export const FEATURE_FLAGS = {
  DISABLE_AI: 'admin_disable_ai',
  DISABLE_MEDIA_PACKS: 'admin_disable_media_packs',
  PRIMARY_KEY_PREF: 'nexa_primary_key',
};

// Results per page
export const RESULTS_PER_PAGE = 10;

// Languages offered in the translation box's language pickers, and the set
// SearchPage's translation-intent detector matches against (see
// detectTranslationIntent in SearchPage.jsx) — centralized so both stay
// in sync instead of duplicating this list.
export const TRANSLATION_LANGUAGES = [
  "English", "Urdu", "Spanish", "French", "German", "Arabic", "Hindi", "Chinese",
  "Japanese", "Russian", "Portuguese", "Italian", "Korean", "Turkish", "Dutch",
  "Polish", "Indonesian", "Vietnamese", "Thai", "Persian", "Bengali", "Punjabi",
  "Marathi", "Telugu", "Tamil", "Gujarati", "Swahili", "Hausa", "Yoruba", "Zulu",
  "Greek", "Swedish", "Norwegian", "Danish", "Finnish", "Czech", "Hungarian", "Romanian"
].sort();
