export const ADULT_KEYWORDS = [
  'porn', 'pornhub', 'sex', 'sexy', 'xnxx', 'xvideos', 'nude', 'nudes',
  'naked', 'boobs', 'tits', 'pussy', 'dick', 'cock', 'blowjob', 'handjob',
  'anal', 'fuck', 'fucking', 'milf', 'hentai', 'bdsm', 'fetish', 'escort',
  'escorts', 'hooker', 'prostitute', 'slut', 'whore', 'masturbate', 'dildo',
  'vibrator', 'sex toy', 'sex toys', 'onlyfans', 'nsfw', 'xhamster', 'redtube',
  'rule34', 'rule 34', 'erotica', 'incest', 'cuckold'
];

export function isAdultQuery(query) {
  if (!query) return false;
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = normalizedQuery.split(/\s+/);
  
  // Check exact word matches to avoid false positives (e.g., "Middlesex" or "Essex")
  for (const word of words) {
    if (ADULT_KEYWORDS.includes(word)) {
      return true;
    }
  }

  // Check phrase matches
  for (const keyword of ADULT_KEYWORDS) {
    if (keyword.includes(' ') && normalizedQuery.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export const INSPIRATIONAL_QUOTES = [
  { text: "Verily, with hardship comes ease.", source: "Quran 94:5" },
  { text: "Do not lose hope, nor be sad.", source: "Quran 3:139" },
  { text: "And He found you lost and guided you.", source: "Quran 93:7" },
  { text: "Patience is a pillar of faith.", source: "Umar ibn Al-Khattab" },
  { text: "What is meant for you will never miss you.", source: "Imam Ali" },
  { text: "A beautiful heart will bring things into your life that all the money in the world couldn't get you.", source: "Omar Suleiman" }
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
  return INSPIRATIONAL_QUOTES[index];
}
