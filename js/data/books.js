// Book library — early-reader stories featuring Shark Hero and Octopus Hero.
//
// Internal IDs preserve the legacy "koala"/"panda" sceneId references
// (which now visually render Shark Hero / Octopus Hero in underwater
// scenes) so the data layer stays compatible. The book TEXT a kid
// actually reads has been rewritten to match the new sea-hero world:
// kelp instead of trees, treasure chests instead of logs, pearls
// instead of balls, sea instead of grass, mask instead of hat.
//
// Every word still validates against ALL_SIGHT_WORDS or ALLOWED_NOUNS
// (words.js) and every sceneId still resolves in sceneArt.js.

export const BOOKS = [
  {
    id: 'where-is-shark',
    title: 'Where Is Shark?',
    level: 1,
    cover: { character: 'koala', accessory: null, variant: 'classic' },
    pages: [
      { text: 'Look! A little shark.',         sceneId: 'little-koala' },
      { text: 'The shark is in the kelp.',     sceneId: 'koala-in-tree' },
      { text: 'The shark is under the kelp.',  sceneId: 'koala-under-tree' },
      { text: 'The shark can jump!',           sceneId: 'koala-jumping' },
    ],
    comprehension: [
      {
        question: 'Where was the shark?',
        options: [
          { sceneId: 'koala-in-tree',    correct: true  },
          { sceneId: 'koala-on-log',     correct: false },
        ],
      },
    ],
  },

  {
    id: 'shark-and-octopus-play',
    title: 'Shark and Octopus Play',
    level: 2,
    cover: { character: 'panda', accessory: 'bamboo', variant: 'classic' },
    pages: [
      { text: 'This is an octopus.',        sceneId: 'little-panda' },
      { text: 'This is a shark.',           sceneId: 'brown-koala' },
      { text: 'They like to play.',         sceneId: 'play-ball' },
      { text: 'They play in the sea.',      sceneId: 'pandas-in-grass' },
      { text: 'The sun is up.',             sceneId: 'sun-up' },
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
    id: 'shark-goes-up',
    title: 'Shark Goes Up',
    level: 1,
    cover: { character: 'koala', accessory: null, variant: 'classic' },
    pages: [
      { text: 'The shark can jump.',          sceneId: 'koala-jumping' },
      { text: 'The shark went up the kelp.',  sceneId: 'koala-in-tree' },
      { text: 'The shark saw the sun.',       sceneId: 'sun-up' },
      { text: 'The shark is up.',             sceneId: 'koala-in-tree' },
    ],
    comprehension: [
      {
        question: 'Where did the shark go?',
        options: [
          { sceneId: 'koala-in-tree', correct: true  },
          { sceneId: 'koala-on-log',  correct: false },
        ],
      },
    ],
  },

  {
    id: 'yellow-and-brown',
    title: 'Yellow and Brown',
    level: 1,
    cover: { character: 'koala', accessory: null, variant: 'warm' },
    pages: [
      { text: 'The sun is yellow.',                 sceneId: 'sun-up' },
      { text: 'The shark is brown.',                sceneId: 'brown-koala' },
      { text: 'The octopus is funny.',              sceneId: 'funny-panda' },
      { text: 'We like all of them.',               sceneId: 'play-ball' },
    ],
    comprehension: [
      {
        question: 'What is yellow?',
        options: [
          { sceneId: 'sun-up',      correct: true  },
          { sceneId: 'brown-koala', correct: false },
        ],
      },
    ],
  },

  {
    id: 'octopuses-in-the-sea',
    title: 'Octopuses in the Sea',
    level: 2,
    cover: { character: 'panda', accessory: 'bamboo', variant: 'pinky' },
    pages: [
      { text: 'Two octopuses play in the sea.',     sceneId: 'pandas-in-grass' },
      { text: 'They have a pearl.',                 sceneId: 'panda-with-ball' },
      { text: 'The octopuses like to eat.',         sceneId: 'panda-eats-bamboo' },
      { text: 'A shark came to play.',              sceneId: 'little-koala' },
      { text: 'They all play with the pearl.',      sceneId: 'play-ball' },
    ],
    comprehension: [
      {
        question: 'What did the octopuses do?',
        options: [
          { sceneId: 'panda-eats-bamboo', correct: true  },
          { sceneId: 'koala-with-hat',    correct: false },
        ],
      },
      {
        question: 'Where do the octopuses play?',
        options: [
          { sceneId: 'pandas-in-grass', correct: true  },
          { sceneId: 'koala-in-tree',   correct: false },
        ],
      },
    ],
  },

  {
    id: 'i-see-you-see',
    title: 'I See, You See',
    level: 2,
    cover: { character: 'panda', accessory: null, variant: 'classic' },
    pages: [
      { text: 'I see a shark.',               sceneId: 'little-koala' },
      { text: 'You see an octopus.',          sceneId: 'little-panda' },
      { text: 'The shark can jump.',          sceneId: 'koala-jumping' },
      { text: 'The octopus can eat.',         sceneId: 'panda-eats-bamboo' },
      { text: 'We can play, too.',            sceneId: 'play-ball' },
    ],
    comprehension: [
      {
        question: 'Who can jump?',
        options: [
          { sceneId: 'koala-jumping', correct: true  },
          { sceneId: 'little-panda',  correct: false },
        ],
      },
    ],
  },

  {
    id: 'what-did-shark-see',
    title: 'What Did Shark See?',
    level: 2,
    cover: { character: 'koala', accessory: 'leaf', variant: 'warm' },
    pages: [
      { text: 'The shark went out to play.',    sceneId: 'little-koala' },
      { text: 'The shark saw a big kelp.',      sceneId: 'koala-under-tree' },
      { text: 'The shark saw the yellow sun.',  sceneId: 'sun-up' },
      { text: 'The shark saw an octopus.',      sceneId: 'little-panda' },
      { text: 'The octopus can eat.',           sceneId: 'panda-eats-bamboo' },
      { text: 'They like to play with a pearl.', sceneId: 'play-ball' },
    ],
    comprehension: [
      {
        question: 'What did the octopus do?',
        options: [
          { sceneId: 'panda-eats-bamboo', correct: true  },
          { sceneId: 'play-ball',         correct: false },
        ],
      },
      {
        question: 'What did the shark see up high?',
        options: [
          { sceneId: 'sun-up',           correct: true  },
          { sceneId: 'koala-under-tree', correct: false },
        ],
      },
    ],
  },

  {
    id: 'the-red-mask',
    title: 'The Red Mask',
    level: 3,
    cover: { character: 'koala', accessory: 'hat', variant: 'classic' },
    pages: [
      { text: 'The shark has a pretty mask.',          sceneId: 'koala-with-hat' },
      { text: 'The mask is red.',                      sceneId: 'koala-with-hat' },
      { text: 'The shark can play with the mask.',     sceneId: 'koala-with-hat' },
      // CYOA: where does the mask go?
      {
        text: 'Where will the shark put the mask?',
        sceneId: 'koala-with-hat',
        choice: {
          question: 'Where does the mask go?',
          options: [
            { label: '🪙 On the chest', text: 'The mask is on the chest.', sceneId: 'koala-on-log' },
            { label: '🌿 In the kelp',  text: 'The mask is in the kelp.',  sceneId: 'koala-in-tree' },
          ],
        },
      },
      { text: 'The octopus saw the mask.',             sceneId: 'little-panda' },
      { text: 'The octopus is funny.',                 sceneId: 'funny-panda' },
    ],
    comprehension: [
      {
        question: 'Who has the red mask?',
        options: [
          { sceneId: 'koala-with-hat', correct: true  },
          { sceneId: 'little-panda',   correct: false },
        ],
      },
      {
        question: 'Who saw the mask?',
        options: [
          { sceneId: 'little-panda', correct: true  },
          { sceneId: 'sun-up',       correct: false },
        ],
      },
    ],
  },

  {
    id: 'three-little-sharks',
    title: 'Three Little Sharks',
    level: 3,
    cover: { character: 'koala', accessory: 'hat', variant: 'warm' },
    pages: [
      { text: 'Look at the three sharks.',  sceneId: 'three-koalas' },
      { text: 'One shark is brown.',        sceneId: 'brown-koala' },
      { text: 'One shark has a red mask.',  sceneId: 'koala-with-hat' },
      // Choose-your-own-adventure: pearl or mask play.
      {
        text: 'The sharks want to play.',
        sceneId: 'three-koalas',
        choice: {
          question: 'What do they play with?',
          options: [
            { label: '🪩 A pearl', text: 'They play with a pearl.', sceneId: 'play-ball' },
            { label: '🥷 A mask',  text: 'They play with a mask.',  sceneId: 'koala-with-hat' },
          ],
        },
      },
      { text: 'The sharks saw an octopus.', sceneId: 'little-panda' },
      { text: 'The octopus is funny.',      sceneId: 'funny-panda' },
      { text: 'They all like to play.',     sceneId: 'play-ball' },
    ],
    comprehension: [
      {
        question: 'Which shark had a mask?',
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
