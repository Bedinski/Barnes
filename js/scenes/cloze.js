// "Fill the Blank" — cloze sentence reading.
//
// Show a scene illustration + the sentence with one word removed and
// replaced with a blank box. The child taps one of 3 word tiles to fill
// the blank. Reading the WHOLE sentence (not just the missing word) is
// what proves they get sentence meaning — that's why this mode complements
// the existing single-word and tile-assembly modes.
//
// Pulls from the same combined pool as Match the Words (book pages +
// standalone sentences) so it directly reinforces what the child reads
// in the books.

import { SENTENCES, tokenize } from '../data/sentences.js';
import { allBookPhrases }     from '../data/books.js';
import { ALL_SIGHT_WORDS, ALLOWED_NOUNS } from '../data/words.js';
import { buildScene }         from '../characters/sceneArt.js';
import { buildStarCounter, rewardStar } from './../components/stars.js';
import { BuddyCorner }        from '../components/buddy.js?v=6';
import { bumpStat }           from '../components/badges.js';
import { speak }              from '../audio/speech.js';
import { success, tryAgain, tap as tapSound } from '../audio/sounds.js';

const NUM_OPTIONS = 3;

// Pool of single-word distractors of the same kind (sight-word vs noun)
// — picking the same kind makes the choice meaningful rather than trivial.
const SIGHT_POOL = ALL_SIGHT_WORDS;
const NOUN_POOL  = ALLOWED_NOUNS;

function isNoun(word) {
  return NOUN_POOL.includes(word.toLowerCase());
}

function strip(word) {
  return word.replace(/[.,!?]/g, '');
}

function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function combinedPool() {
  return [...SENTENCES, ...allBookPhrases()];
}

/**
 * Pick one round.  Choose a sentence, choose a word in it that is "worth"
 * blanking (length >= 3 to avoid trivial words like "a", "is"), pick 2
 * distractors of the same kind, and shuffle the option order.
 *
 * Exported so tests can stub the RNG.
 */
export function pickRound(pool = combinedPool(), rng = Math.random) {
  const target = pool[Math.floor(rng() * pool.length)];
  const tokens = tokenize(target.text);

  // Index of the word we're blanking. Prefer nouns (most picture-relevant),
  // fall back to any word ≥ 3 letters that isn't the very first token
  // (capitalisation hint), fall back to any word.
  const candidates =
    tokens.map((w, i) => ({ w: strip(w), i }))
      .filter((c) => c.i > 0 && c.w.length >= 3);
  const nounCands = candidates.filter((c) => isNoun(c.w));
  const pickFrom = (nounCands.length ? nounCands : candidates.length ? candidates : tokens.map((w, i) => ({ w: strip(w), i })));
  const chosen = pickFrom[Math.floor(rng() * pickFrom.length)];

  // Distractors: 2 unique words of the same kind, not equal to the answer.
  const sameKind = isNoun(chosen.w) ? NOUN_POOL : SIGHT_POOL;
  const distractors = shuffle(sameKind.filter((w) => w.toLowerCase() !== chosen.w.toLowerCase()), rng)
    .slice(0, NUM_OPTIONS - 1);

  const options = shuffle([chosen.w, ...distractors], rng);
  return { target, blankIndex: chosen.i, answer: chosen.w, options };
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene cloze';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  const hear = document.createElement('button');
  hear.className = 'btn';
  hear.textContent = '🔊 Hear it';
  top.appendChild(back);
  top.appendChild(buildStarCounter());
  top.appendChild(hear);
  scene.appendChild(top);
  scene.appendChild(BuddyCorner({ size: 'chibi' }));

  const sceneSlot = document.createElement('div');
  sceneSlot.className = 'scene-card cloze-art';
  sceneSlot.style.maxWidth = '640px';
  sceneSlot.style.margin   = '0 auto';
  scene.appendChild(sceneSlot);

  const sentenceEl = document.createElement('p');
  sentenceEl.className = 'cloze-sentence';
  scene.appendChild(sentenceEl);

  const tray = document.createElement('div');
  tray.className = 'tile-tray';
  scene.appendChild(tray);

  container.appendChild(scene);

  let current = null;
  let blankSpan = null;

  const renderRound = () => {
    sceneSlot.innerHTML = '';
    sentenceEl.innerHTML = '';
    tray.innerHTML = '';
    current = pickRound();

    sceneSlot.appendChild(buildScene(current.target.sceneId));

    const tokens = tokenize(current.target.text);
    tokens.forEach((tok, i) => {
      if (i > 0) sentenceEl.appendChild(document.createTextNode(' '));
      if (i === current.blankIndex) {
        blankSpan = document.createElement('span');
        blankSpan.className = 'cloze-blank';
        blankSpan.textContent = '_____';
        blankSpan.dataset.blank = 'true';
        sentenceEl.appendChild(blankSpan);
      } else {
        const w = document.createElement('span');
        w.className = 'cloze-word';
        w.textContent = tok;
        sentenceEl.appendChild(w);
      }
    });
    // Period at end (we tokenize without it).
    if (/[.!?]$/.test(current.target.text)) {
      sentenceEl.appendChild(document.createTextNode(current.target.text.slice(-1)));
    }

    current.options.forEach((opt) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.textContent = opt;
      tile.dataset.word = opt;
      tile.addEventListener('click', () => {
        tapSound();
        if (opt.toLowerCase() === current.answer.toLowerCase()) {
          // Fill the blank, speak the whole sentence, award.
          blankSpan.textContent = opt;
          blankSpan.classList.add('is-filled');
          success();
          rewardStar();
          bumpStat('rounds', 1);
          // Reading the whole sentence (not just the answer) is the point.
          const filled = current.target.text.replace(/_+/g, opt);
          speak(filled);
          setTimeout(renderRound, 1900);
        } else {
          tryAgain();
          tile.classList.add('is-wrong');
          setTimeout(() => tile.classList.remove('is-wrong'), 500);
          speak('Try again.');
        }
      });
      tray.appendChild(tile);
    });

    // Auto-read the sentence with the blank pronounced as "blank".
    setTimeout(() => speak(current.target.text.replace(/\b\w+\b/g,
      (w, idx) => (idx === posOfBlank(current) ? 'blank' : w))), 350);
  };

  const posOfBlank = (round) => {
    // Char index of the answer word within the original sentence text.
    const tokens = tokenize(round.target.text);
    const before = tokens.slice(0, round.blankIndex).join(' ');
    return before.length + (before ? 1 : 0);
  };

  hear.addEventListener('click', () => {
    tapSound();
    if (current) speak(current.target.text);
  });

  renderRound();
  return () => { tray.innerHTML = ''; sentenceEl.innerHTML = ''; sceneSlot.innerHTML = ''; };
}
