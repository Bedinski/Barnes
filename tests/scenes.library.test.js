import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount, isLevelUnlocked, isBookUnlocked } from '../js/scenes/library.js';
import { BOOKS } from '../js/data/books.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('all levels are always unlocked (locking removed)', () => {
  assert.equal(isLevelUnlocked(1, new Set()), true);
  assert.equal(isLevelUnlocked(2, new Set()), true);
  assert.equal(isLevelUnlocked(3, new Set()), true);
});

test('every book is always unlocked', () => {
  for (const b of BOOKS) {
    assert.equal(isBookUnlocked(b, new Set()), true);
  }
});

test('library renders one stop per book, grouped into 3 level bands', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.equal(root.querySelectorAll('.map-stop').length, BOOKS.length);
  assert.equal(root.querySelectorAll('.map-band').length, 3);
  unmount();
});

test('every map stop is rendered as unlocked — no lock icon, no locked class', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const stops = root.querySelectorAll('.map-stop');
  for (const s of stops) {
    assert.ok(s.classList.contains('unlocked'), `stop ${s.dataset.bookId} should be unlocked`);
    assert.ok(!s.classList.contains('locked'),  `stop ${s.dataset.bookId} should NOT be locked`);
  }
  // No 🔒 lock badges anywhere on the map.
  assert.equal(root.querySelectorAll('.map-lock').length, 0);
});

test('a completed book still shows the ✓ done badge', () => {
  const someL1 = BOOKS.find((b) => b.level === 1).id;
  globalThis.localStorage.setItem('kpr.books', JSON.stringify([someL1]));
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const stop = root.querySelector(`[data-book-id="${someL1}"]`);
  assert.ok(stop.classList.contains('done'));
  assert.ok(stop.querySelector('.map-done'));
});

test('clicking ANY book — even level 3 with no progress — opens the reader', () => {
  const calls = [];
  const ctx = { navigate: (n, d) => calls.push([n, d]) };
  const root = document.getElementById('app');
  mount(root, ctx);
  const l3book = BOOKS.find((b) => b.level === 3);
  const stop = root.querySelector(`[data-book-id="${l3book.id}"]`);
  stop.click();
  assert.equal(calls[0][0], 'reader');
  assert.equal(calls[0][1].bookId, l3book.id);
});

test('Home back button navigates to home', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
});
