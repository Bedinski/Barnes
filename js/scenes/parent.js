// Parent dashboard — a quiet stats screen for grown-ups. Surfaces what's
// in localStorage today: stars, books read, words tapped, streak,
// mastered pages, badges earned. Read-only; nothing here changes data.
//
// Reachable from the home gear menu later (and via direct navigate
// for now). Plain layout — this view is for adults, not the kid.

import { getStats, getEarnedBadgeIds, BADGES } from '../components/badges.js';
import { getCurrentStreak, loadStreak } from '../components/streak.js';
import { getStarCount } from '../components/stars.js';
import { BOOKS } from '../data/books.js';
import { tap as tapSound } from '../audio/sounds.js';

function statCard(emoji, label, value) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  card.innerHTML = `<div class="stat-emoji">${emoji}</div>
                    <div class="stat-value">${value}</div>
                    <div class="stat-label">${label}</div>`;
  return card;
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene parent';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'For Grown-Ups';
  title.style.margin = '0';
  top.appendChild(back);
  top.appendChild(title);
  scene.appendChild(top);

  const stats = getStats();
  const streak = loadStreak();
  const stars = getStarCount();
  const earnedBadges = getEarnedBadgeIds();
  const booksReadCount = stats.booksRead || 0;

  const grid = document.createElement('div');
  grid.className = 'stat-grid';
  grid.appendChild(statCard('⭐', 'Stars earned',         stars));
  grid.appendChild(statCard('📚', 'Books read',           booksReadCount));
  grid.appendChild(statCard('🔥', 'Current streak (days)', getCurrentStreak()));
  grid.appendChild(statCard('🏆', 'Pages mastered (3+ reads)', stats.pagesMastered || 0));
  grid.appendChild(statCard('👆', 'Words tapped',         stats.wordsTapped || 0));
  grid.appendChild(statCard('🎯', 'Practice rounds won',  stats.rounds || 0));
  grid.appendChild(statCard('🎖️', 'Badges earned',        `${earnedBadges.length} / ${BADGES.length}`));
  grid.appendChild(statCard('📈', 'Longest streak',       streak.longest || 0));
  scene.appendChild(grid);

  // Per-book breakdown.
  const booksHead = document.createElement('h2');
  booksHead.className = 'subhead';
  booksHead.textContent = 'Library';
  scene.appendChild(booksHead);

  const booksList = document.createElement('div');
  booksList.className = 'parent-books';

  // Per-page read counts (from reader's KEY_PAGE_READS).
  let pageReads = {};
  try { pageReads = JSON.parse(globalThis.localStorage?.getItem('kpr.pageReads') || '{}'); }
  catch (_) { /* noop */ }

  let completed = [];
  try { completed = JSON.parse(globalThis.localStorage?.getItem('kpr.books') || '[]'); }
  catch (_) { /* noop */ }

  BOOKS.forEach((book) => {
    const row = document.createElement('div');
    row.className = 'parent-book';
    const totalReads = book.pages.reduce((n, _, i) => n + (pageReads[`${book.id}:${i}`] || 0), 0);
    const masteredPages = book.pages.filter((_, i) => (pageReads[`${book.id}:${i}`] || 0) >= 3).length;
    const isComplete = completed.includes(book.id);
    row.innerHTML = `
      <div class="parent-book-title">${'⭐'.repeat(book.level)} ${book.title} ${isComplete ? '✓' : ''}</div>
      <div class="parent-book-stats">
        Pages: ${book.pages.length}
        · Total reads: ${totalReads}
        · Mastered: ${masteredPages}/${book.pages.length}
      </div>`;
    booksList.appendChild(row);
  });
  scene.appendChild(booksList);

  // Earned badges list.
  const badgesHead = document.createElement('h2');
  badgesHead.className = 'subhead';
  badgesHead.textContent = `Badges (${earnedBadges.length} / ${BADGES.length})`;
  scene.appendChild(badgesHead);

  const badgeList = document.createElement('div');
  badgeList.className = 'parent-badges';
  BADGES.forEach((b) => {
    const earned = earnedBadges.includes(b.id);
    const row = document.createElement('div');
    row.className = 'parent-badge ' + (earned ? 'earned' : 'locked');
    row.innerHTML = `<span class="emoji">${b.emoji}</span>
                     <span class="name">${b.label}</span>
                     <span class="hint">${earned ? '✓ Earned' : b.hint}</span>`;
    badgeList.appendChild(row);
  });
  scene.appendChild(badgeList);

  container.appendChild(scene);
  return () => {};
}
