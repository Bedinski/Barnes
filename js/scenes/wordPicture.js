// "Match the Words" — show a phrase or sentence, tap the matching scene.
// Pulls from book pages AND the standalone sentence list so phrase-matching
// reinforces the exact vocabulary the child is seeing while reading.

import { SENTENCES } from '../data/sentences.js';
import { allBookPhrases } from '../data/books.js';
import { buildScene, listScenes } from '../characters/sceneArt.js';
import { buildStarCounter, rewardStar } from '../components/stars.js';
import { bumpStat } from '../components/badges.js';
import { speak } from '../audio/speech.js';
import { success, tryAgain, tap as tapSound } from '../audio/sounds.js';

function shuffle(arr, rng = Math.random) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Combined pool: book pages (primary reinforcement) + general sentences.
function phrasePool() {
  return [...allBookPhrases(), ...SENTENCES];
}

export function pickRound(pool = phrasePool(), allScenes = listScenes(), rng = Math.random) {
  const target = pool[Math.floor(rng() * pool.length)];
  const distractorPool = allScenes.filter((id) => id !== target.sceneId);
  const distractor = distractorPool[Math.floor(rng() * distractorPool.length)];
  const order = shuffle([target.sceneId, distractor], rng);
  return { target, order };
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene word-picture';

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

  const sentenceEl = document.createElement('div');
  sentenceEl.className = 'prompt';
  scene.appendChild(sentenceEl);

  const row = document.createElement('div');
  row.className = 'card-row';
  scene.appendChild(row);

  container.appendChild(scene);

  let currentTargetId = '';
  let currentText = '';

  const startRound = () => {
    row.innerHTML = '';
    const { target, order } = pickRound();
    currentTargetId = target.sceneId;
    currentText = target.text;
    sentenceEl.textContent = target.text;

    order.forEach((sceneId) => {
      const card = document.createElement('div');
      card.className = 'scene-card';
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', sceneId);
      card.tabIndex = 0;
      card.appendChild(buildScene(sceneId));
      row.appendChild(card);

      const choose = () => {
        if (sceneId === currentTargetId) {
          tapSound();
          success();
          const rect = card.getBoundingClientRect();
          rewardStar({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          bumpStat('rounds', 1);
          speak('Yes! ' + currentText);
          setTimeout(startRound, 1800);
        } else {
          tryAgain();
          if (typeof card.animate === 'function') {
            card.animate(
              [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }],
              { duration: 380 },
            );
          }
          speak('Try again. ' + currentText);
        }
      };
      card.addEventListener('click', choose);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
      });
    });

    setTimeout(() => speak(currentText), 300);
  };

  hear.addEventListener('click', () => { tapSound(); if (currentText) speak(currentText); });

  startRound();
  return () => { row.innerHTML = ''; };
}
