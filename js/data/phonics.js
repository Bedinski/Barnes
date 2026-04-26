// CVC word families (Science-of-Reading core).
//
// Each family has a "rime" (e.g. "-at") and a set of picturable words
// that vary only the onset consonant. This is the standard model for
// teaching beginning decoders to swap onsets while holding the rime
// constant — they learn to recognise the chunk and decode quickly.
//
// Each word includes an emoji used as the picture clue in the
// match-the-word mini game. Words have to be picturable for a 6-year-old.

export const FAMILIES = [
  {
    id: 'at', rime: 'at',
    words: [
      { word: 'cat', emoji: '🐱' },
      { word: 'bat', emoji: '🦇' },
      { word: 'hat', emoji: '🎩' },
      { word: 'rat', emoji: '🐀' },
    ],
  },
  {
    id: 'an', rime: 'an',
    words: [
      { word: 'can', emoji: '🥫' },
      { word: 'fan', emoji: '🪭' },
      { word: 'pan', emoji: '🍳' },
      { word: 'man', emoji: '🚶' },
    ],
  },
  {
    id: 'ig', rime: 'ig',
    words: [
      { word: 'pig', emoji: '🐷' },
      { word: 'wig', emoji: '💇' },
      { word: 'big', emoji: '🦣' },
      { word: 'dig', emoji: '⛏️' },
    ],
  },
  {
    id: 'un', rime: 'un',
    words: [
      { word: 'sun', emoji: '☀️' },
      { word: 'run', emoji: '🏃' },
      { word: 'bun', emoji: '🍞' },
      { word: 'fun', emoji: '🎉' },
    ],
  },
  {
    id: 'og', rime: 'og',
    words: [
      { word: 'dog', emoji: '🐕' },
      { word: 'log', emoji: '🪵' },
      { word: 'fog', emoji: '🌫️' },
    ],
  },
  {
    id: 'op', rime: 'op',
    words: [
      { word: 'top', emoji: '🔝' },
      { word: 'mop', emoji: '🧹' },
      { word: 'pop', emoji: '🍿' },
      { word: 'hop', emoji: '🐰' },
    ],
  },
];

// Crude phoneme map for the consonants/vowels we use. The Web Speech API
// has no first-class way to say individual phonemes, so we ask the voice
// to speak short pseudo-words that approximate each sound. Accuracy is
// best on Samantha / Google US English; on other voices it's still
// closer to the phoneme than reading the letter name aloud (which would
// say "see, ay, tee" for cat — letter names, not sounds).
export const PHONEME = {
  a: 'ah',  b: 'buh', c: 'kuh', d: 'duh', e: 'eh',
  f: 'ff',  g: 'guh', h: 'huh', i: 'ih',  j: 'juh',
  k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', o: 'ah',
  p: 'puh', q: 'kw',  r: 'rrr', s: 'sss', t: 'tuh',
  u: 'uh',  v: 'vvv', w: 'wuh', x: 'ks',  y: 'yuh',
  z: 'zz',
};

export function phonemeFor(letter) {
  return PHONEME[String(letter).toLowerCase()] || letter;
}

export function getFamily(id) {
  return FAMILIES.find((f) => f.id === id) || null;
}
