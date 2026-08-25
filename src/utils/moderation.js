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
  { text: "Patience is a pillar of faith.", source: "Umar ibn Al-Khattab" },
  { text: "What is meant for you will never miss you.", source: "Imam Ali" },
  { text: "A beautiful heart will bring things into your life that all the money in the world couldn't get you.", source: "Omar Suleiman" }
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
  return INSPIRATIONAL_QUOTES[index];
}
