// "Find the Word" — app speaks a target sight word; 3 baby koalas/pandas
// each hold a word-card; child taps the card matching the spoken word.

import { ALL_WORDS } from '../data/words.js';
import { buildKoala } from '../characters/koala.js';
import { buildPanda } from '../characters/panda.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter, rewardStar } from '../components/stars.js';
import { speak } from '../audio/speech.js';
import { success, tryAgain, tap as tapSound } from '../audio/sounds.js';

const CHOICES_PER_ROUND = 3;

function shuffle(arr, rng = Math.random) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRound(wordList, rng = Math.random) {
  const pool = shuffle(wordList, rng).slice(0, CHOICES_PER_ROUND);
  const target = pool[Math.floor(rng() * pool.length)];
  return { target, choices: pool };
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene tap-word';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  const hear = document.createElement('button');
  hear.className = 'btn';
  hear.textContent = '🔊 Again';
  top.appendChild(back);
  top.appendChild(buildStarCounter());
  top.appendChild(hear);
  scene.appendChild(top);

  const prompt = document.createElement('h2');
  prompt.className = 'prompt';
  scene.appendChild(prompt);

  const row = document.createElement('div');
  row.className = 'card-row';
  scene.appendChild(row);

  container.appendChild(scene);

  let currentTarget = '';
  let currentHandles = [];

  const cleanupRound = () => {
    currentHandles.forEach((h) => h.detach());
    currentHandles = [];
    row.innerHTML = '';
  };

  const startRound = () => {
    cleanupRound();
    const { target, choices } = pickRound(ALL_WORDS);
    currentTarget = target;
    prompt.textContent = `Find: ${target}`;

    choices.forEach((word, i) => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', word);
      card.tabIndex = 0;

      const useKoala = i % 2 === 0;
      const svg = useKoala
        ? buildKoala({ size: 'medium', variant: i === 0 ? 'classic' : 'warm' })
        : buildPanda({ size: 'medium', variant: i === 1 ? 'classic' : 'pinky' });
      card.appendChild(svg);

      const label = document.createElement('div');
      label.className = 'word-label';
      label.textContent = word;
      card.appendChild(label);

      row.appendChild(card);
      const h = animate(svg);
      currentHandles.push(h);

      const choose = (ev) => {
        if (word === currentTarget) {
          tapSound();
          success();
          h.cheer();
          const rect = card.getBoundingClientRect();
          rewardStar({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          speak(`Great job! That's ${word}.`);
          setTimeout(startRound, 1600);
        } else {
          tryAgain();
          h.wiggle();
          speak(`Try again. Find ${currentTarget}.`);
        }
      };
      card.addEventListener('click', choose);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(e); }
      });
    });

    // Pick one mascot as "the speaker" so talk-sync only moves one mouth.
    if (currentHandles[0]) currentHandles[0].setSpeaker(true);
    setTimeout(() => speak(`Find the word: ${target}.`), 250);
  };

  hear.addEventListener('click', () => {
    tapSound();
    if (currentTarget) speak(`Find the word: ${currentTarget}.`);
  });

  startRound();

  return () => cleanupRound();
}
