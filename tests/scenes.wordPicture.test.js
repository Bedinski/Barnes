import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount, pickRound } from '../js/scenes/wordPicture.js';
import { SENTENCES } from '../js/data/sentences.js';
import { listScenes } from '../js/characters/sceneArt.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('pickRound() returns target sentence with 2 distinct scene cards', () => {
  const r = pickRound(SENTENCES, listScenes());
  assert.ok(r.target.text.endsWith('.'));
  assert.equal(r.order.length, 2);
  assert.notEqual(r.order[0], r.order[1]);
  assert.ok(r.order.includes(r.target.sceneId));
});

test('mount() renders sentence text and 2 scene cards', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  const prompt = root.querySelector('.prompt');
  assert.ok(prompt.textContent.length > 0);
  assert.equal(root.querySelectorAll('.scene-card').length, 2);
  unmount();
});

test('clicking the correct scene card awards a star', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  const text = root.querySelector('.prompt').textContent;
  const target = SENTENCES.find((s) => s.text === text);
  assert.ok(target, 'displayed sentence should match a known sentence');
  const cards = Array.from(root.querySelectorAll('.scene-card'));
  const correct = cards.find((c) => c.getAttribute('aria-label') === target.sceneId);
  // animate() is provided by JSDOM via Element.prototype but may be missing.
  if (typeof correct.animate !== 'function') correct.animate = () => ({ finished: Promise.resolve() });
  correct.click();
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), '1');
  unmount();
});

test('Home button navigates back', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
  unmount();
});
