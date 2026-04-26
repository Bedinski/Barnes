import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/phonics.js';
import { FAMILIES } from '../js/data/phonics.js';
import { _resetBadges } from '../js/components/badges.js';

beforeEach(() => {
  _resetBadges();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('phonics opens with a family-picker grid', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const cards = root.querySelectorAll('.family-card');
  assert.equal(cards.length, FAMILIES.length);
});

test('selecting a family opens the blender with one row per word', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  const card = root.querySelector('.family-card');
  const familyId = card.dataset.familyId;
  card.click();
  const family = FAMILIES.find((f) => f.id === familyId);
  const rows = root.querySelectorAll('.phonics-word-row');
  assert.equal(rows.length, family.words.length);
  // Each row has 3 letter buttons (CVC).
  rows.forEach((row) => {
    assert.equal(row.querySelectorAll('.phonics-letter').length, 3);
  });
});

test('clicking the "Now play the game" button shows the match game', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  root.querySelector('.family-card').click();
  // Find the Play button by text.
  const playBtn = Array.from(root.querySelectorAll('.btn'))
    .find((b) => /Now play the game/i.test(b.textContent));
  assert.ok(playBtn);
  playBtn.click();
  // Match game shows: emoji art + a tile tray.
  assert.ok(root.querySelector('.phonics-match-art'));
  assert.equal(root.querySelectorAll('.tile').length, 3);
});

test('match game: clicking the correct tile awards a star', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  mount(root, ctx);
  root.querySelector('.family-card').click();
  Array.from(root.querySelectorAll('.btn'))
    .find((b) => /Now play the game/i.test(b.textContent)).click();

  // Walk through tiles until one increments stars.
  const tiles = Array.from(root.querySelectorAll('.tile'));
  for (const t of tiles) {
    t.click();
    if (globalThis.localStorage.getItem('kpr.stars') === '1') return;
  }
  assert.fail('exactly one tile should be the correct answer and award a star');
});

test('Home button returns to home', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
});
