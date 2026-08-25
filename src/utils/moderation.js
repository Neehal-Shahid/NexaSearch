// Unambiguous adult terms/sites — always blocked, regardless of medical
// context. Nothing here has a legitimate medical/educational reading, so
// unlike AMBIGUOUS_KEYWORDS below, these are never eligible for the
// MEDICAL_ALLOWLIST bypass (that used to be exploitable, e.g. "pornhub
// treatment" or "xnxx doctor" previously passed as safe — see below).
export const EXPLICIT_KEYWORDS = [
  'porn', 'porno', 'pornographic', 'pornhub', 'xxx', 'xnxx', 'xvideos',
  'xhamster', 'redtube', 'youporn', 'spankbang', 'chaturbate', 'stripchat',
  'bongacams', 'livejasmin', 'brazzers', 'motherless', 'thothub', 'onlyfans',
  'nsfw', 'hentai', 'rule34', 'rule 34', 'erotica', 'fetish', 'bdsm',
  'incest', 'cuckold', 'gangbang', 'creampie', 'deepthroat', 'cumshot',
  'blowjob', 'handjob', 'anal sex', 'anal', 'fuck', 'fucking', 'pussy',
  'dick', 'cock', 'milf', 'slut', 'whore', 'masturbate', 'masturbation',
  'dildo', 'vibrator', 'sex toy', 'sex toys', 'escort', 'escorts', 'hooker',
  'hookers', 'prostitute', 'prostitutes', 'adult video', 'adult videos',
  '18+ video', '18+ videos', 'camgirl', 'cam girl', 'leaked nudes', 'nude leaks',
];

// Genuinely ambiguous terms with real anatomical/medical/educational uses
// ("breast cancer", "kissing disease", "sex education") — these are the
// only ones eligible for the MEDICAL_ALLOWLIST bypass.
export const AMBIGUOUS_KEYWORDS = [
  'sex', 'sexy', 'nude', 'nudes', 'naked', 'boobs', 'tits', 'breast',
  'breasts', 'nipple', 'nipples', 'kissing',
];

export const MEDICAL_ALLOWLIST = [
  'disease', 'diseases', 'education', 'cancer', 'health', 'anatomy', 'biology',
  'medical', 'doctor', 'treatment', 'symptom', 'symptoms', 'virus', 'infection', 'std'
];

function matchesKeywordList(words, normalizedString, keywordList) {
  // Exact word matches prevent flagging innocent words containing adult
  // substrings (e.g., "Middlesex", "Essex", "peacock").
  if (words.some(word => keywordList.includes(word))) return true;

  // Phrase matches — handles multi-word keywords like "sex toys" or "18+ videos".
  return keywordList.some(keyword => keyword.includes(' ') && normalizedString.includes(keyword));
}

export function isAdultQuery(query) {
  if (!query) return false;

  // Normalize for both word and phrase checking (preserves numbers, allows 18+)
  const normalizedString = query.toLowerCase().replace(/[^a-z0-9\+\s]/g, '');
  const words = normalizedString.split(/\s+/);

  // 1. Explicit terms block immediately — no medical bypass applies here.
  if (matchesKeywordList(words, normalizedString, EXPLICIT_KEYWORDS)) {
    return true;
  }

  // 2. Ambiguous terms only block if there's no medical/educational context
  // alongside them (e.g. "breast cancer" is allowed, bare "breast" is not).
  if (matchesKeywordList(words, normalizedString, AMBIGUOUS_KEYWORDS)) {
    const isMedicalContext = words.some(word => MEDICAL_ALLOWLIST.includes(word));
    return !isMedicalContext;
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
