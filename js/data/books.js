// Book library — early-reader stories featuring koalas & pandas.
// Every word must appear in ALL_SIGHT_WORDS or ALLOWED_NOUNS (words.js)
// and every sceneId must resolve in sceneArt.js.
// Difficulty is in `level` (1=easiest, 3=hardest). Later books can be
// added by appending to this array.

export const BOOKS = [
  {
    id: 'where-is-koala',
    title: 'Where Is Koala?',
    level: 1,
    cover: { character: 'koala', accessory: null, variant: 'classic' },
    pages: [
      { text: 'Look! A little koala.',        sceneId: 'little-koala' },
      { text: 'The koala is in the tree.',    sceneId: 'koala-in-tree' },
      { text: 'The koala is under the tree.', sceneId: 'koala-under-tree' },
      { text: 'The koala can jump!',          sceneId: 'koala-jumping' },
    ],
    comprehension: [
      {
        question: 'Where was the koala?',
        options: [
          { sceneId: 'koala-in-tree',    correct: true  },
          { sceneId: 'koala-on-log',     correct: false },
        ],
      },
    ],
  },

  {
    id: 'panda-and-koala-play',
    title: 'Panda and Koala Play',
    level: 2,
    cover: { character: 'panda', accessory: 'bamboo', variant: 'classic' },
    pages: [
      { text: 'This is a panda.',          sceneId: 'little-panda' },
      { text: 'This is a koala.',          sceneId: 'brown-koala' },
      { text: 'They like to play.',        sceneId: 'play-ball' },
      { text: 'They play in the grass.',   sceneId: 'pandas-in-grass' },
      { text: 'The sun is up.',            sceneId: 'sun-up' },
    ],
    comprehension: [
      {
        question: 'What did they do?',
        options: [
          { sceneId: 'play-ball',       correct: true  },
          { sceneId: 'koala-in-tree',   correct: false },
        ],
      },
      {
        question: 'Where did they play?',
        options: [
          { sceneId: 'pandas-in-grass', correct: true  },
          { sceneId: 'koala-on-log',    correct: false },
        ],
      },
    ],
  },

  {
    id: 'three-little-koalas',
    title: 'Three Little Koalas',
    level: 3,
    cover: { character: 'koala', accessory: 'hat', variant: 'warm' },
    pages: [
      { text: 'Look at the three koalas.', sceneId: 'three-koalas' },
      { text: 'One koala is brown.',       sceneId: 'brown-koala' },
      { text: 'One koala has a red hat.',  sceneId: 'koala-with-hat' },
      // Choose-your-own-adventure: the child picks the play activity.
      // Both branches use existing scenes + known vocabulary so they're
      // fully decodable, and they converge at the next page.
      {
        text: 'The koalas want to play.',
        sceneId: 'three-koalas',
        choice: {
          question: 'What do they play with?',
          options: [
            { label: '⚽ A ball', text: 'They play with a ball.', sceneId: 'play-ball' },
            { label: '🎩 A hat',  text: 'They play with a hat.',  sceneId: 'koala-with-hat' },
          ],
        },
      },
      { text: 'The koalas saw a panda.',   sceneId: 'little-panda' },
      { text: 'The panda is funny.',       sceneId: 'funny-panda' },
      { text: 'They all like to play.',    sceneId: 'play-ball' },
    ],
    comprehension: [
      {
        question: 'Which koala had a hat?',
        options: [
          { sceneId: 'koala-with-hat', correct: true  },
          { sceneId: 'brown-koala',    correct: false },
        ],
      },
      {
        question: 'Who was funny?',
        options: [
          { sceneId: 'funny-panda',    correct: true  },
          { sceneId: 'three-koalas',   correct: false },
        ],
      },
    ],
  },
];

export function getBook(id) {
  return BOOKS.find((b) => b.id === id) || null;
}

// Return all phrase-level snippets used across all books — the "Match the
// Words" scene draws from this so phrase-matching reinforces exactly the
// language the child is seeing while reading.
export function allBookPhrases() {
  const out = [];
  for (const book of BOOKS) {
    for (const page of book.pages) {
      out.push({ text: page.text, sceneId: page.sceneId, bookId: book.id });
    }
  }
  return out;
}
