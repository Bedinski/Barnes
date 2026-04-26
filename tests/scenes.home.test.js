import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/home.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('home renders 5 mode cards (Books + 4 practice modes)', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.equal(root.querySelectorAll('.mode-card').length, 5);
  unmount();
});

test('first card is the primary "Read a Book" card', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const firstCard = root.querySelector('.mode-card');
  assert.ok(firstCard.classList.contains('mode-card--primary'),
    'the Books card should be visually primary');
  assert.match(firstCard.textContent, /Book/i);
  unmount();
});

test('tapping the primary card navigates to library', () => {
  let navTo = null;
  const ctx = { navigate: (n) => { navTo = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  root.querySelector('.mode-card--primary').click();
  assert.equal(navTo, 'library');
  unmount();
});

test('the practice cards route to phonics, cloze, wordPicture, and buildSentence', () => {
  const navCalls = [];
  const ctx = { navigate: (n) => navCalls.push(n) };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const nonPrimary = Array.from(root.querySelectorAll('.mode-card:not(.mode-card--primary)'));
  assert.equal(nonPrimary.length, 4);
  nonPrimary.forEach((c) => c.click());
  assert.ok(navCalls.includes('phonics'),       'should route to phonics');
  assert.ok(navCalls.includes('cloze'),         'should route to cloze');
  assert.ok(navCalls.includes('wordPicture'),   'should route to wordPicture');
  assert.ok(navCalls.includes('buildSentence'), 'should route to buildSentence');
  unmount();
});

test('home shows the streak chip and badge gallery', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.ok(root.querySelector('.streak-chip'),   'streak chip should be rendered');
  assert.ok(root.querySelector('.badge-gallery'), 'badge gallery should be rendered');
  assert.ok(root.querySelectorAll('.badge-chip').length >= 5, 'multiple badges shown');
  unmount();
});

test('home does NOT render a tapWord / single-word drill card', () => {
  // Regression guard: user explicitly removed this mode as too basic.
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const labels = Array.from(root.querySelectorAll('.mode-card .label'))
    .map((el) => el.textContent.toLowerCase());
  for (const l of labels) {
    assert.ok(!/find the word/.test(l), `unexpected label "${l}"`);
  }
  unmount();
});
