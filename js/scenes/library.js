// Library — grid of book covers. Each cover has a lively mascot that
// breathes, blinks, and waves; tapping opens the reader for that book.

import { BOOKS } from '../data/books.js';
import { buildKoala } from '../characters/koala.js';
import { buildPanda } from '../characters/panda.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter } from '../components/stars.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

const LEVEL_LABEL = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

function completedBookIds() {
  try {
    const raw = globalThis.localStorage?.getItem('kpr.books') || '[]';
    return new Set(JSON.parse(raw));
  } catch (_) {
    return new Set();
  }
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene library';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  top.appendChild(back);
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'Pick a Book';
  title.style.margin = '0';
  top.appendChild(title);
  top.appendChild(buildStarCounter());
  scene.appendChild(top);

  const grid = document.createElement('div');
  grid.className = 'book-grid';
  scene.appendChild(grid);
  container.appendChild(scene);

  const handles = [];
  const done = completedBookIds();

  BOOKS.forEach((book, i) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Read ${book.title}`);
    card.tabIndex = 0;
    card.dataset.bookId = book.id;

    const badge = document.createElement('span');
    badge.className = 'level-badge';
    badge.textContent = LEVEL_LABEL[book.level] || '⭐';
    card.appendChild(badge);

    if (done.has(book.id)) {
      const chk = document.createElement('span');
      chk.className = 'read-badge';
      chk.textContent = '✓ Read';
      card.appendChild(chk);
    }

    const slot = document.createElement('div');
    slot.className = 'character-slot';
    const svg = book.cover.character === 'koala'
      ? buildKoala({ accessory: book.cover.accessory, variant: book.cover.variant, size: 'medium' })
      : buildPanda({ accessory: book.cover.accessory, variant: book.cover.variant, size: 'medium' });
    slot.appendChild(svg);
    card.appendChild(slot);

    const t = document.createElement('div');
    t.className = 'book-title';
    t.textContent = book.title;
    card.appendChild(t);

    grid.appendChild(card);
    const h = animate(svg);
    handles.push(h);
    setTimeout(() => h.wave(), 300 + i * 220);

    const open = () => {
      tapSound();
      ctx.navigate('reader', { bookId: book.id });
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  setTimeout(() => speak('Pick a book to read.'), 300);

  return () => handles.forEach((h) => h.detach());
}
