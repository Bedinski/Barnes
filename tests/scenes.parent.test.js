import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/parent.js';
import { _resetBadges, bumpStat, BADGES } from '../js/components/badges.js';
import { _resetStreak, tickStreak } from '../js/components/streak.js';
import { setStarCount } from '../js/components/stars.js';
import { BOOKS } from '../js/data/books.js';

beforeEach(() => {
  _resetBadges();
  _resetStreak();
  globalThis.localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
});

test('parent dashboard renders all stat tiles', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const tiles = root.querySelectorAll('.stat-card');
  assert.ok(tiles.length >= 6, `expected at least 6 stat tiles, got ${tiles.length}`);
});

test('stat values reflect persisted progress', () => {
  setStarCount(7);
  bumpStat('booksRead', 2);
  bumpStat('wordsTapped', 33);
  tickStreak('2026-04-26');
  tickStreak('2026-04-27');

  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);

  const text = root.textContent;
  assert.match(text, /7/,  'stars 7 visible');
  assert.match(text, /2/,  'books 2 visible');
  assert.match(text, /33/, 'words tapped 33 visible');
});

test('every book is listed with its level and read counts', () => {
  globalThis.localStorage.setItem('kpr.pageReads', JSON.stringify({
    [`${BOOKS[0].id}:0`]: 4, // mastered
    [`${BOOKS[0].id}:1`]: 2,
  }));
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const rows = root.querySelectorAll('.parent-book');
  assert.equal(rows.length, BOOKS.length);
  // The first book row should reflect 4+2=6 total reads, 1 mastered.
  assert.match(rows[0].textContent, /Total reads: 6/);
  assert.match(rows[0].textContent, /Mastered: 1\//);
});

test('badge list shows BADGES.length entries with locked/earned state', () => {
  bumpStat('booksRead', 1); // earn first-book
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const rows = root.querySelectorAll('.parent-badge');
  assert.equal(rows.length, BADGES.length);
  assert.ok(root.querySelector('.parent-badge.earned'), 'at least one earned badge row');
  assert.ok(root.querySelector('.parent-badge.locked'), 'at least one locked badge row');
});

test('Home back button navigates home', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
});
