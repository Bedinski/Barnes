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

test('Level 1 is always unlocked', () => {
  assert.equal(isLevelUnlocked(1, new Set()), true);
});

test('Level 2 unlocks after any level 1 book is finished', () => {
  assert.equal(isLevelUnlocked(2, new Set()), false);
  const someL1 = BOOKS.find((b) => b.level === 1).id;
  assert.equal(isLevelUnlocked(2, new Set([someL1])), true);
});

test('Level 3 unlocks after any level 2 book is finished', () => {
  const someL2 = BOOKS.find((b) => b.level === 2).id;
  assert.equal(isLevelUnlocked(3, new Set()), false);
  assert.equal(isLevelUnlocked(3, new Set([someL2])), true);
});

test('library renders one stop per book, grouped into 3 level bands', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.equal(root.querySelectorAll('.map-stop').length, BOOKS.length);
  assert.equal(root.querySelectorAll('.map-band').length, 3);
  unmount();
});

test('all level 1 stops are unlocked from the start; level 2/3 are locked', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const l1Band = root.querySelector('.map-band.level-1');
  const l2Band = root.querySelector('.map-band.level-2');
  assert.ok(l1Band.classList.contains('unlocked'));
  assert.ok(l2Band.classList.contains('locked'));
  // Each stop in level 1 has class unlocked.
  for (const li of l1Band.querySelectorAll('.map-stop')) {
    assert.ok(li.classList.contains('unlocked'));
  }
  for (const li of l2Band.querySelectorAll('.map-stop')) {
    assert.ok(li.classList.contains('locked'));
  }
});

test('completing a level 1 book unlocks every level 2 stop', () => {
  const someL1 = BOOKS.find((b) => b.level === 1).id;
  globalThis.localStorage.setItem('kpr.books', JSON.stringify([someL1]));
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const l2Band = root.querySelector('.map-band.level-2');
  assert.ok(l2Band.classList.contains('unlocked'));
  for (const li of l2Band.querySelectorAll('.map-stop')) {
    assert.ok(li.classList.contains('unlocked'));
  }
});

test('a completed book shows the ✓ done badge', () => {
  const someL1 = BOOKS.find((b) => b.level === 1).id;
  globalThis.localStorage.setItem('kpr.books', JSON.stringify([someL1]));
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const stop = root.querySelector(`[data-book-id="${someL1}"]`);
  assert.ok(stop.classList.contains('done'));
  assert.ok(stop.querySelector('.map-done'));
});

test('clicking an unlocked book navigates to reader with that bookId', () => {
  const calls = [];
  const ctx = { navigate: (n, d) => calls.push([n, d]) };
  const root = document.getElementById('app');
  mount(root, ctx);
  const firstStop = root.querySelector('.map-stop.unlocked');
  firstStop.click();
  assert.equal(calls[0][0], 'reader');
  assert.ok(calls[0][1] && calls[0][1].bookId);
});

test('clicking a locked book does NOT navigate', () => {
  const calls = [];
  const ctx = { navigate: (n) => calls.push(n) };
  const root = document.getElementById('app');
  mount(root, ctx);
  // Level 2 should be locked initially.
  const lockedStop = root.querySelector('.map-stop.locked');
  if (lockedStop) {
    lockedStop.click();
    assert.equal(calls.length, 0, 'locked stops must not navigate');
  }
});

test('Home back button navigates to home', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
});

test('isBookUnlocked returns true only when the book\'s level is unlocked', () => {
  const l2book = BOOKS.find((b) => b.level === 2);
  const someL1 = BOOKS.find((b) => b.level === 1).id;
  assert.equal(isBookUnlocked(l2book, new Set()), false);
  assert.equal(isBookUnlocked(l2book, new Set([someL1])), true);
});
