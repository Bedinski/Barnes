// Library — replaced flat grid with a serpentine **progression map**.
//
// Design rationale: gamified path layouts (think Duolingo's lessons,
// Lalilo's progress map) materially boost retention vs flat lists.
// The map shows every book as a "stop" along a winding path. Mascots
// hop along the path as the child finishes books.
//
// Unlock rules: ALL books are unlocked all the time. Level bands
// remain so kids see difficulty progression visually, but the child can
// jump to whichever story interests them — locking out content was
// punitive, especially when the easy books are quick to outgrow.

import { BOOKS } from '../data/books.js';
import { buildKoala } from '../characters/koala.js?v=6';
import { buildPanda } from '../characters/panda.js?v=6';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter } from '../components/stars.js';
import { BuddyCorner } from '../components/buddy.js?v=6';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

function completedBookIds() {
  try {
    return new Set(JSON.parse(globalThis.localStorage?.getItem('kpr.books') || '[]'));
  } catch (_) {
    return new Set();
  }
}

// Kept exported for any caller that wants to know — but always returns
// true now. Removing the function entirely would be a breaking API change.
export function isLevelUnlocked(_level, _completed) {
  return true;
}

export function isBookUnlocked(_book, _completed) {
  return true;
}

const LEVEL_LABEL = { 1: '⭐ Easy',  2: '⭐⭐ Medium', 3: '⭐⭐⭐ Tricky' };

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene library map';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  top.appendChild(back);
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'Reading Map';
  title.style.margin = '0';
  top.appendChild(title);
  top.appendChild(buildStarCounter());
  scene.appendChild(top);

  // Phase B: chibi buddy floats in the corner of every screen.
  scene.appendChild(BuddyCorner({ size: 'chibi' }));

  const mapBody = document.createElement('div');
  mapBody.className = 'map-body';
  scene.appendChild(mapBody);
  container.appendChild(scene);

  const completed = completedBookIds();
  const handles = [];

  // Group books by level so each level gets its own visual band.
  const byLevel = { 1: [], 2: [], 3: [] };
  for (const b of BOOKS) {
    if (byLevel[b.level]) byLevel[b.level].push(b);
  }

  let stopCounter = 0;

  [1, 2, 3].forEach((level) => {
    const books = byLevel[level];
    if (!books.length) return;

    const band = document.createElement('section');
    band.className = `map-band level-${level} unlocked`;

    const head = document.createElement('h2');
    head.className = 'map-band-head';
    head.textContent = LEVEL_LABEL[level] || `Level ${level}`;
    band.appendChild(head);

    const path = document.createElement('ol');
    path.className = 'map-path';

    books.forEach((book) => {
      const li = document.createElement('li');
      const isDone = completed.has(book.id);
      li.className = 'map-stop unlocked' + (isDone ? ' done' : '');
      li.dataset.bookId = book.id;
      li.dataset.idx = String(stopCounter++);
      li.style.setProperty('--stop-index', String(li.dataset.idx));

      const island = document.createElement('div');
      island.className = 'map-island';

      const charSlot = document.createElement('div');
      charSlot.className = 'character-slot';
      const svg = book.cover.character === 'koala'
        ? buildKoala({ accessory: book.cover.accessory, variant: book.cover.variant, size: 'medium' })
        : buildPanda({ accessory: book.cover.accessory, variant: book.cover.variant, size: 'medium' });
      charSlot.appendChild(svg);
      island.appendChild(charSlot);

      if (isDone) {
        const tick = document.createElement('span');
        tick.className = 'map-done';
        tick.textContent = '✓';
        island.appendChild(tick);
      }

      const titleEl = document.createElement('div');
      titleEl.className = 'map-book-title';
      titleEl.textContent = book.title;
      island.appendChild(titleEl);

      li.appendChild(island);
      path.appendChild(li);

      const h = animate(svg);
      handles.push(h);

      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `Read ${book.title}`);
      li.tabIndex = 0;
      const open = () => { tapSound(); ctx.navigate('reader', { bookId: book.id }); };
      li.addEventListener('click', open);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });

    band.appendChild(path);
    mapBody.appendChild(band);
  });

  // Welcome line, slightly different first time vs returning.
  setTimeout(() => {
    const text = completed.size === 0
      ? 'This is your reading map. Pick a book to start!'
      : 'Welcome back. Pick your next book.';
    speak(text);
  }, 350);

  return () => handles.forEach((h) => h.detach());
}
