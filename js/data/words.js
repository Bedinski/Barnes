// Sight word lists for end-of-Kindergarten / start-of-1st grade.
// Source: Dolch sight word lists (public domain).
// Lists are kept lowercase, alphabetical, deduplicated.

// Pre-K Dolch words — the most basic sight words that a child entering
// Kindergarten should already recognize. We don't actively drill these in
// the "Find the Word" mode, but sentences are allowed to use them.
export const PRE_K = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
  'funny', 'go', 'help', 'here', 'i', 'in', 'is', 'it', 'jump', 'little',
  'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
  'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
];

export const KINDERGARTEN = [
  'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
  'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
  'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty',
  'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there',
  'they', 'this', 'too', 'under', 'want', 'was', 'well', 'went', 'what',
  'white', 'who', 'will', 'with', 'yes',
];

export const FIRST_GRADE = [
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every',
  'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his',
  'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once',
  'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank',
  'them', 'then', 'think', 'walk', 'were', 'when',
];

// Words actively practiced in the "Find the Word" game (K + 1st only —
// pre-K words are assumed already mastered).
export const ALL_WORDS = [...KINDERGARTEN, ...FIRST_GRADE];

// Every sight word the game knows about (used for sentence validation).
export const ALL_SIGHT_WORDS = [...PRE_K, ...KINDERGARTEN, ...FIRST_GRADE];

// Decodable nouns that may appear in sentences in addition to sight words.
// The first cluster ("panda" / "koala" / "tree" / etc.) is preserved
// for backward compat — the underlying sceneIds and tests still
// reference these legacy names. The second cluster is the new
// sea-hero vocabulary. A 7-year-old sees sentences about sharks /
// octopuses / coral / treasure that match the new visual world.
export const ALLOWED_NOUNS = [
  // Legacy (sceneId / test compat)
  'panda', 'pandas', 'koala', 'koalas', 'bamboo', 'tree', 'sun', 'log',
  'ball', 'hat', 'leaf', 'leaves', 'sky', 'grass',
  // Sea-hero theme
  'shark', 'sharks', 'octopus', 'octopuses',
  'fish', 'kelp', 'reef', 'coral', 'sea', 'wave', 'waves',
  'pearl', 'pearls', 'treasure', 'chest', 'bubble', 'bubbles',
  'mask', 'cape',
];
