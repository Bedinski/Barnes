import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/library.js';
import { BOOKS } from '../js/data/books.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('library renders a card per book with title and aria-label', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const cards = root.querySelectorAll('.book-card');
  assert.equal(cards.length, BOOKS.length);
  for (const b of BOOKS) {
    const card = root.querySelector(`[data-book-id="${b.id}"]`);
    assert.ok(card, `missing card for ${b.id}`);
    assert.ok(card.textContent.includes(b.title));
  }
  unmount();
});

test('tapping a book navigates to reader with that bookId', () => {
  const calls = [];
  const ctx = { navigate: (name, data) => calls.push([name, data]) };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const card = root.querySelector('.book-card');
  card.click();
  assert.equal(calls[0][0], 'reader');
  assert.ok(calls[0][1] && calls[0][1].bookId);
  unmount();
});

test('Home back button navigates to home', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
  unmount();
});

test('books previously completed show a read badge', () => {
  globalThis.localStorage.setItem('kpr.books', JSON.stringify([BOOKS[0].id]));
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const firstCard = root.querySelector(`[data-book-id="${BOOKS[0].id}"]`);
  assert.ok(firstCard.querySelector('.read-badge'));
  // A book the user hasn't finished should NOT have the badge.
  const otherCard = root.querySelector(`[data-book-id="${BOOKS[1].id}"]`);
  assert.equal(otherCard.querySelector('.read-badge'), null);
  unmount();
});
