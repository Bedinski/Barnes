// "Build a Sentence" — show a scene; child arranges shuffled word tiles
// into the sentence that describes it.

import { SENTENCES, tokenize } from '../data/sentences.js';
import { buildScene } from '../characters/sceneArt.js';
import { buildStarCounter, rewardStar } from '../components/stars.js';
import { BuddyCorner } from '../components/buddy.js';
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

export function pickRound(sentences = SENTENCES, rng = Math.random) {
  const target = sentences[Math.floor(rng() * sentences.length)];
  const targetWords = tokenize(target.text);
  return { target, targetWords, shuffled: shuffle(targetWords, rng) };
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene build-sentence';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  const hear = document.createElement('button');
  hear.className = 'btn';
  hear.textContent = '🔊 Hint';
  top.appendChild(back);
  top.appendChild(buildStarCounter());
  top.appendChild(hear);
  scene.appendChild(top);
  scene.appendChild(BuddyCorner({ size: 'chibi' }));

  const sceneSlot = document.createElement('div');
  sceneSlot.className = 'scene-card';
  sceneSlot.style.maxWidth = '640px';
  sceneSlot.style.margin = '0 auto';
  scene.appendChild(sceneSlot);

  const strip = document.createElement('div');
  strip.className = 'sentence-strip';
  scene.appendChild(strip);

  const tray = document.createElement('div');
  tray.className = 'tile-tray';
  scene.appendChild(tray);

  container.appendChild(scene);

  let currentTarget = null;

  const checkComplete = () => {
    const placed = Array.from(strip.children).map((slot) => slot.dataset.word || '');
    if (placed.some((w) => !w)) return;
    const target = currentTarget.targetWords;
    if (placed.length !== target.length) return;
    const ok = placed.every((w, i) => w.toLowerCase() === target[i].toLowerCase());
    if (ok) {
      success();
      rewardStar();
      bumpStat('rounds', 1);
      speak(currentTarget.target.text);
      setTimeout(startRound, 2200);
    } else {
      tryAgain();
      speak('Almost! Try again. ' + currentTarget.target.text);
    }
  };

  function startRound() {
    sceneSlot.innerHTML = '';
    strip.innerHTML = '';
    tray.innerHTML = '';
    currentTarget = pickRound();

    sceneSlot.appendChild(buildScene(currentTarget.target.sceneId));

    currentTarget.targetWords.forEach((_, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.idx = String(i);
      slot.addEventListener('click', () => {
        const w = slot.dataset.word;
        if (!w) return;
        tapSound();
        slot.dataset.word = '';
        slot.textContent = '';
        // Re-add tile to tray
        addTile(w);
      });
      strip.appendChild(slot);
    });

    function addTile(word) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.textContent = word;
      tile.dataset.word = word;
      tile.addEventListener('click', () => {
        tapSound();
        const emptySlot = Array.from(strip.children).find((s) => !s.dataset.word);
        if (!emptySlot) return;
        emptySlot.dataset.word = word;
        emptySlot.textContent = word;
        emptySlot.classList.add('placed');
        tile.remove();
        checkComplete();
      });
      tray.appendChild(tile);
    }

    currentTarget.shuffled.forEach(addTile);
    setTimeout(() => speak('Build the sentence about this picture.'), 300);
  }

  hear.addEventListener('click', () => {
    tapSound();
    if (currentTarget) speak(currentTarget.target.text);
  });

  startRound();
  return () => { sceneSlot.innerHTML = ''; strip.innerHTML = ''; tray.innerHTML = ''; };
}
