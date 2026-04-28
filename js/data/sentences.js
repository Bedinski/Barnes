// Decodable Kindergarten / start-of-1st sentences.
//
// Every word must appear in ALL_SIGHT_WORDS or ALLOWED_NOUNS (words.js)
// and every sceneId must resolve in characters/sceneArt.js.
//
// Design rules (enforced by tests/data.sentences.test.js):
//
//   1. Every sentence ends with a period — models basic punctuation.
//   2. No content token may appear twice in the same sentence. The
//      articles "a" and "the" may each appear at most once. This kills
//      the "multiple correct orderings" problem in Build-a-Sentence:
//      with no duplicate tokens, the only correct ordering is the
//      authored one.
//   3. The corpus is graded into three bands by token count:
//        L1 — 3 or 4 tokens (early decoders, mostly sight words)
//        L2 — 5 or 6 tokens (color, possession, prepositional)
//        L3 — 7 or 8 tokens (richer phrases, two ideas)
//   4. No two sentences share the same multiset of tokens (otherwise
//      Build-a-Sentence couldn't disambiguate the target round).
//
// All sceneIds reuse builders that already exist in sceneArt.js — the
// rewrite intentionally avoids adding scene art so the visual budget
// stays focused on the world map.

// Sea-hero corpus: each sceneId still resolves to an art builder
// that renders Shark Hero / Octopus Hero in an underwater scene. The
// sentence text uses the new sea-themed vocabulary so the words a
// 7-year-old reads match the world they're seeing.
export const SENTENCES = [
  // ---------- L1: 3-4 tokens ----------
  { text: 'The sun is up.',                 sceneId: 'sun-up' },
  { text: 'I see a shark.',                 sceneId: 'little-koala' },
  { text: 'I see an octopus.',              sceneId: 'little-panda' },
  { text: 'The shark can run.',             sceneId: 'koala-running' },
  { text: 'Two octopuses play.',            sceneId: 'pandas-in-grass' },
  { text: 'A shark can jump.',              sceneId: 'koala-jumping' },
  { text: 'The octopus can eat.',           sceneId: 'panda-eats-bamboo' },
  { text: 'Look at the sun.',               sceneId: 'sun-up' },
  { text: 'The shark is up.',               sceneId: 'koala-in-tree' },

  // ---------- L2: 5-6 tokens ----------
  { text: 'The shark has a red mask.',      sceneId: 'koala-with-hat' },
  { text: 'Look at the brown shark.',       sceneId: 'brown-koala' },
  { text: 'The shark is on a chest.',       sceneId: 'koala-on-log' },
  { text: 'I see three little sharks.',     sceneId: 'three-koalas' },
  { text: 'The octopus has a yellow pearl.', sceneId: 'panda-with-ball' },
  { text: 'A shark is in the kelp.',        sceneId: 'koala-in-tree' },
  { text: 'Look at the funny octopus.',     sceneId: 'funny-panda' },
  { text: 'A shark is under the kelp.',     sceneId: 'koala-under-tree' },
  { text: 'I like the little octopus.',     sceneId: 'little-panda' },

  // ---------- L3: 7-8 tokens ----------
  { text: 'I like to see the octopus eat.', sceneId: 'panda-eats-bamboo' },
  { text: 'Two little octopuses play in the sea.', sceneId: 'pandas-in-grass' },
  { text: 'Look at the three funny little sharks.', sceneId: 'three-koalas' },
  { text: 'A shark can jump up the chest.', sceneId: 'koala-jumping' },
  { text: 'We can play with a yellow pearl.', sceneId: 'play-ball' },
  { text: 'I see a funny octopus eat bamboo.', sceneId: 'panda-eats-bamboo' },
  { text: 'The little shark is on a chest.', sceneId: 'koala-on-log' },
];

// Split a sentence text into ordered word tokens, stripping the period.
// Used by the Build-a-Sentence scene and by tests.
export function tokenize(text) {
  return text
    .replace(/[.!?]$/, '')
    .split(/\s+/)
    .filter(Boolean);
}
