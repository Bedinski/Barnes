import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount, pickRound } from '../js/scenes/tapWord.js';
import { ALL_WORDS } from '../js/data/words.js';
import { _resetAnimator } from '../js/characters/animator.js';

function makeRng(seed = 1) {
  // Tiny LCG for deterministic shuffles in tests.
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('pickRound() returns 3 unique choices including the target', () => {
  const rng = makeRng(42);
  const { target, choices } = pickRound(ALL_WORDS, rng);
  assert.equal(choices.length, 3);
  assert.equal(new Set(choices).size, 3);
  assert.ok(choices.includes(target));
});

test('mount() renders 3 choice cards and a prompt', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const cards = root.querySelectorAll('.choice-card');
  assert.equal(cards.length, 3);
  const prompt = root.querySelector('.prompt');
  assert.ok(prompt);
  assert.match(prompt.textContent, /Find:/);
  unmount();
});

test('mount() includes a Home back-button that calls navigate("home")', () => {
  let navTo = null;
  const ctx = { navigate: (n) => { navTo = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const back = root.querySelector('.btn--ghost');
  back.click();
  assert.equal(navTo, 'home');
  unmount();
});

test('clicking the correct word card increments the star count', async () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const prompt = root.querySelector('.prompt');
  const target = prompt.textContent.replace(/^Find:\s*/, '').trim();
  const cards = Array.from(root.querySelectorAll('.choice-card'));
  const correct = cards.find((c) => c.querySelector('.word-label').textContent === target);
  assert.ok(correct, 'a card should match the prompt');
  correct.click();
  // rewardStar fires synchronously; check localStorage.
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), '1');
  unmount();
});

test('clicking a wrong card does NOT increment the star count', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const prompt = root.querySelector('.prompt');
  const target = prompt.textContent.replace(/^Find:\s*/, '').trim();
  const cards = Array.from(root.querySelectorAll('.choice-card'));
  const wrong = cards.find((c) => c.querySelector('.word-label').textContent !== target);
  wrong.click();
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), null);
  unmount();
});
