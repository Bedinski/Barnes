// Decodable Kindergarten / start-of-1st sentences.
// Every word must appear in ALL_SIGHT_WORDS or ALLOWED_NOUNS (words.js)
// and every sceneId must resolve in characters/sceneArt.js.
// Each sentence ends with a period to model basic punctuation.

export const SENTENCES = [
  { text: 'The sun is up.',                 sceneId: 'sun-up' },
  { text: 'The panda can eat bamboo.',      sceneId: 'panda-eats-bamboo' },
  { text: 'The koala is in the tree.',      sceneId: 'koala-in-tree' },
  { text: 'The koala is on a log.',         sceneId: 'koala-on-log' },
  { text: 'I see a little panda.',          sceneId: 'little-panda' },
  { text: 'We can play with the ball.',     sceneId: 'play-ball' },
  { text: 'The koala has a red hat.',       sceneId: 'koala-with-hat' },
  { text: 'Look at the brown koala.',       sceneId: 'brown-koala' },
  { text: 'The koala can jump up.',         sceneId: 'koala-jumping' },
  { text: 'Two pandas play in the grass.',  sceneId: 'pandas-in-grass' },
  { text: 'The koala is under the tree.',   sceneId: 'koala-under-tree' },
  { text: 'I like the funny panda.',        sceneId: 'funny-panda' },
  { text: 'Look at the three koalas.',      sceneId: 'three-koalas' },
  { text: 'The panda has a yellow ball.',   sceneId: 'panda-with-ball' },
  { text: 'The koala can run.',             sceneId: 'koala-running' },
];

// Split a sentence text into ordered word tokens, stripping the period.
// Used by the Build-a-Sentence scene and by tests.
export function tokenize(text) {
  return text
    .replace(/\.$/, '')
    .split(/\s+/)
    .filter(Boolean);
}
