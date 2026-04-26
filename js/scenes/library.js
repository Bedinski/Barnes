// Library — replaced flat grid with a serpentine **progression map**.
//
// Design rationale: gamified path layouts (think Duolingo's lessons,
// Lalilo's progress map) materially boost retention vs flat lists.
// The map shows every book as a "stop" along a winding path. Mascots
// hop along the path as the child finishes books.
//
// Unlock rules — keep the gate gentle, not punitive:
//   - All Level 1 books are unlocked from the start.
//   - Level 2 unlocks after the child finishes any 1 Level 1 book.
//   - Level 3 unlocks after the child finishes any 1 Level 2 book.
// Inside a level, every book is unlocked once the level is — so the
// child can pick which one to read.

import { BOOKS } from '../data/books.js';
import { buildKoala } from '../characters/koala.js';
import { buildPanda } from '../characters/panda.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter } from '../components/stars.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

function completedBookIds() {
  try {
    return new Set(JSON.parse(globalThis.localStorage?.getItem('kpr.books') || '[]'));
  } catch (_) {
    return new Set();
  }
}

export function isLevelUnlocked(level, completed) {
  if (level === 1) return true;
  // Need to have completed any book whose level is < this one.
  for (const b of BOOKS) {
    if (b.level === level - 1 && completed.has(b.id)) return true;
  }
  return false;
}

export function isBookUnlocked(book, completed) {
  return isLevelUnlocked(book.level, completed);
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
    band.className = `map-band level-${level}` + (isLevelUnlocked(level, completed) ? ' unlocked' : ' locked');

    const head = document.createElement('h2');
    head.className = 'map-band-head';
    head.textContent = LEVEL_LABEL[level] || `Level ${level}`;
    if (!isLevelUnlocked(level, completed)) {
      const lock = document.createElement('span');
      lock.className = 'lock-hint';
      lock.textContent = ' 🔒 Finish a book below to unlock';
      head.appendChild(lock);
    }
    band.appendChild(head);

    const path = document.createElement('ol');
    path.className = 'map-path';

    books.forEach((book) => {
      const li = document.createElement('li');
      const unlocked = isLevelUnlocked(level, completed);
      const isDone = completed.has(book.id);
      li.className = 'map-stop' + (unlocked ? ' unlocked' : ' locked') + (isDone ? ' done' : '');
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

      if (!unlocked) {
        const lock = document.createElement('span');
        lock.className = 'map-lock';
        lock.textContent = '🔒';
        island.appendChild(lock);
      }
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

      if (unlocked) {
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', `Read ${book.title}`);
        li.tabIndex = 0;
        const open = () => { tapSound(); ctx.navigate('reader', { bookId: book.id }); };
        li.addEventListener('click', open);
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
      } else {
        li.setAttribute('aria-label', `${book.title} — locked. Finish a level ${level - 1} book to unlock.`);
      }
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
