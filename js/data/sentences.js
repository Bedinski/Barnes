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

export const SENTENCES = [
  // ---------- L1: 3-4 tokens ----------
  { text: 'The sun is up.',                 sceneId: 'sun-up' },
  { text: 'I see a panda.',                 sceneId: 'little-panda' },
  { text: 'I see a koala.',                 sceneId: 'little-koala' },
  { text: 'The koala can run.',             sceneId: 'koala-running' },
  { text: 'Two pandas play.',               sceneId: 'pandas-in-grass' },
  { text: 'A koala can jump.',              sceneId: 'koala-jumping' },
  { text: 'The panda can eat.',             sceneId: 'panda-eats-bamboo' },
  { text: 'Look at the sun.',               sceneId: 'sun-up' },
  { text: 'The koala is up.',               sceneId: 'koala-in-tree' },

  // ---------- L2: 5-6 tokens ----------
  { text: 'The koala has a red hat.',       sceneId: 'koala-with-hat' },
  { text: 'Look at the brown koala.',       sceneId: 'brown-koala' },
  { text: 'The koala is on a log.',         sceneId: 'koala-on-log' },
  { text: 'I see three little koalas.',     sceneId: 'three-koalas' },
  { text: 'The panda has a yellow ball.',   sceneId: 'panda-with-ball' },
  { text: 'A koala is in the tree.',        sceneId: 'koala-in-tree' },
  { text: 'Look at the funny panda.',       sceneId: 'funny-panda' },
  { text: 'A koala is under the tree.',     sceneId: 'koala-under-tree' },
  { text: 'I like the little panda.',       sceneId: 'little-panda' },

  // ---------- L3: 7-8 tokens ----------
  { text: 'I like to see the panda eat.',   sceneId: 'panda-eats-bamboo' },
  { text: 'Two little pandas play in the grass.', sceneId: 'pandas-in-grass' },
  { text: 'Look at the three funny little koalas.', sceneId: 'three-koalas' },
  { text: 'A koala can jump up the tree.',  sceneId: 'koala-jumping' },
  { text: 'We can play with a yellow ball.', sceneId: 'play-ball' },
  { text: 'I see a funny panda eat bamboo.', sceneId: 'panda-eats-bamboo' },
  { text: 'The little koala is on a log.',  sceneId: 'koala-on-log' },
];

// Split a sentence text into ordered word tokens, stripping the period.
// Used by the Build-a-Sentence scene and by tests.
export function tokenize(text) {
  return text
    .replace(/[.!?]$/, '')
    .split(/\s+/)
    .filter(Boolean);
}
