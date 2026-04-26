// Home screen.
//
// Primary card: Read a Book.
// Three practice modes reinforce the same vocabulary the books use:
//   - Match the Words   (phrase → picture)
//   - Build a Sentence  (tile assembly)
//   - Fill the Blank    (cloze sentence reading)
//
// Topbar surfaces the streak chip + earned badges so the child sees
// their progress every time they come back.

import { buildKoala } from '../characters/koala.js';
import { buildPanda } from '../characters/panda.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter }   from '../components/stars.js';
import { buildBadgeGallery }  from '../components/badges.js';
import { buildStreakChip }    from '../components/streak.js';
import { buildSettingsButton } from '../components/settings.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

const MODES = [
  { id: 'library',       label: '📚 Read a Book',     character: 'koala', accessory: 'leaf',   variant: 'classic', primary: true  },
  { id: 'cloze',         label: '🧠 Fill the Blank',  character: 'koala', accessory: null,     variant: 'warm',    primary: false },
  { id: 'wordPicture',   label: '🧩 Match the Words', character: 'panda', accessory: 'bamboo', variant: 'classic', primary: false },
  { id: 'buildSentence', label: '✍️ Build a Sentence',character: 'panda', accessory: 'bow',    variant: 'pinky',   primary: false },
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
  top.appendChild(buildStreakChip());
  top.appendChild(buildStarCounter());
  top.appendChild(buildSettingsButton());
  const parentLink = document.createElement('button');
  parentLink.type = 'button';
  parentLink.className = 'btn btn--ghost parent-link';
  parentLink.title = 'For grown-ups';
  parentLink.setAttribute('aria-label', 'Open grown-ups dashboard');
  parentLink.textContent = '👪';
  parentLink.addEventListener('click', () => { tapSound(); ctx.navigate('parent'); });
  top.appendChild(parentLink);
  scene.appendChild(top);

  const gallery = buildBadgeGallery();
  scene.appendChild(gallery);

  const grid = document.createElement('div');
  grid.className = 'home-grid';

  const handles = [];
  MODES.forEach((mode, i) => {
    const card = document.createElement('div');
    card.className = mode.primary ? 'mode-card mode-card--primary' : 'mode-card';
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', mode.label);
    card.tabIndex = 0;

    const slot = document.createElement('div');
    slot.className = 'character-slot';
    const charSvg = mode.character === 'koala'
      ? buildKoala({ accessory: mode.accessory, variant: mode.variant, size: mode.primary ? 'tall' : 'medium' })
      : buildPanda({ accessory: mode.accessory, variant: mode.variant, size: mode.primary ? 'tall' : 'medium' });
    slot.appendChild(charSvg);
    card.appendChild(slot);

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = mode.label;
    card.appendChild(label);

    grid.appendChild(card);

    const h = animate(charSvg);
    handles.push(h);
    setTimeout(() => h.wave(), 350 + i * 220);

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

  setTimeout(() => speak('Hi! Pick a book, or play a game.'), 400);

  return () => handles.forEach((h) => h.detach());
}
