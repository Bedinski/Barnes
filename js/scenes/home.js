// Home screen: pick a game mode. Each card has a live mascot that
// breathes, blinks, and tracks the cursor — so the screen feels lived-in
// the moment it loads.

import { buildKoala } from '../characters/koala.js';
import { buildPanda } from '../characters/panda.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter } from '../components/stars.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

const MODES = [
  { id: 'tapWord',        label: 'Find the Word',  character: 'koala', accessory: null,    variant: 'classic' },
  { id: 'wordPicture',    label: 'Match the Story',character: 'panda', accessory: 'bamboo', variant: 'classic' },
  { id: 'buildSentence',  label: 'Build a Sentence',character: 'panda', accessory: 'bow',  variant: 'pinky'   },
];

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene home';

  const top = document.createElement('div');
  top.className = 'topbar';
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'Koala & Panda Reading';
  top.appendChild(title);
  top.appendChild(buildStarCounter());
  scene.appendChild(top);

  const grid = document.createElement('div');
  grid.className = 'home-grid';

  const handles = [];
  MODES.forEach((mode, i) => {
    const card = document.createElement('div');
    card.className = 'mode-card';
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', mode.label);
    card.tabIndex = 0;

    const slot = document.createElement('div');
    slot.className = 'character-slot';
    const charSvg = mode.character === 'koala'
      ? buildKoala({ accessory: mode.accessory, variant: mode.variant, size: 'tall' })
      : buildPanda({ accessory: mode.accessory, variant: mode.variant, size: 'tall' });
    slot.appendChild(charSvg);
    card.appendChild(slot);

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = mode.label;
    card.appendChild(label);

    grid.appendChild(card);

    const h = animate(charSvg);
    handles.push(h);
    // Stagger waves so they don't all wave at once.
    setTimeout(() => h.wave(), 350 + i * 250);

    const go = () => {
      tapSound();
      ctx.navigate(mode.id);
    };
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  scene.appendChild(grid);
  container.appendChild(scene);

  // Welcome speech once the page has settled.
  setTimeout(() => speak('Hi! Pick a game to play.'), 400);

  return () => handles.forEach((h) => h.detach());
}
