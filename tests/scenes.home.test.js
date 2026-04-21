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

test('home renders exactly 3 mode cards', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.equal(root.querySelectorAll('.mode-card').length, 3);
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

test('the other two cards navigate to wordPicture and buildSentence', () => {
  const navCalls = [];
  const ctx = { navigate: (n) => navCalls.push(n) };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const nonPrimary = Array.from(root.querySelectorAll('.mode-card:not(.mode-card--primary)'));
  assert.equal(nonPrimary.length, 2);
  nonPrimary.forEach((c) => c.click());
  assert.ok(navCalls.includes('wordPicture'));
  assert.ok(navCalls.includes('buildSentence'));
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
