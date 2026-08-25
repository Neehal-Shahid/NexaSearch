export const ADULT_KEYWORDS = [
  'porn', 'pornhub', 'sex', 'sexy', 'xnxx', 'xvideos', 'nude', 'nudes',
  'naked', 'boobs', 'tits', 'pussy', 'dick', 'cock', 'blowjob', 'handjob',
  'anal', 'fuck', 'fucking', 'milf', 'hentai', 'bdsm', 'fetish', 'escort',
  'escorts', 'hooker', 'prostitute', 'slut', 'whore', 'masturbate', 'dildo',
  'vibrator', 'sex toy', 'sex toys', 'onlyfans', 'nsfw', 'xhamster', 'redtube',
  'rule34', 'rule 34', 'erotica', 'incest', 'cuckold', 'adult video', 'adult videos',
  '18+ video', '18+ videos', 'kissing', 'breast', 'breasts', 'nipple', 'nipples'
];

export const MEDICAL_ALLOWLIST = [
  'disease', 'diseases', 'education', 'cancer', 'health', 'anatomy', 'biology',
  'medical', 'doctor', 'treatment', 'symptom', 'symptoms', 'virus', 'infection', 'std'
];

export function isAdultQuery(query) {
  if (!query) return false;
  
  // Create a normalized string for phrase checking (preserves numbers, allows 18+)
  const normalizedString = query.toLowerCase().replace(/[^a-z0-9\+\s]/g, '');
  const words = normalizedString.split(/\s+/);
  
  // 1. Check for medical/educational bypass first
  // If the query contains a medical term, we let it pass the basic keyword block
  // (e.g. "sex diseases", "breast cancer")
  const isMedicalContext = words.some(word => MEDICAL_ALLOWLIST.includes(word));
  if (isMedicalContext) {
    return false;
  }

  // 2. Check exact word matches
  // Using exact word matches prevents flagging innocent words containing adult substrings 
  // (e.g., "Middlesex", "Essex", "peacock")
  for (const word of words) {
    if (ADULT_KEYWORDS.includes(word)) {
      return true;
    }
  }

  // 3. Check phrase matches
  // Handles multi-word keywords like "sex toys" or "18+ videos"
  for (const keyword of ADULT_KEYWORDS) {
    if (keyword.includes(' ') && normalizedString.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export const INSPIRATIONAL_QUOTES = [
  { text: "Verily, with hardship comes ease.", source: "Quran 94:5" },
  { text: "Do not lose hope, nor be sad.", source: "Quran 3:139" },
  { text: "And He found you lost and guided you.", source: "Quran 93:7" },
  { text: "And do not approach unlawful sexual intercourse. Indeed, it is ever an immorality and is evil as a way.", source: "Quran 17:32" },
  { text: "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'", source: "Quran 39:53" },
  { text: "Every soul will taste death. And We test you with evil and with good as trial; and to Us you will be returned.", source: "Quran 21:35" },
  { text: "Know that the life of this world is but amusement and diversion...", source: "Quran 57:20" },
  { text: "O mankind, indeed the promise of Allah is truth, so let not the worldly life delude you...", source: "Quran 35:5" },
  { text: "And whoever turns away from My remembrance - indeed, he will have a depressed life.", source: "Quran 20:124" },
  { text: "Return to your Lord, well-pleased and pleasing [to Him].", source: "Quran 89:28" }
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
  return INSPIRATIONAL_QUOTES[index];
}
