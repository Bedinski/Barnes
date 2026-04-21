import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount, pickRound } from '../js/scenes/wordPicture.js';
import { SENTENCES } from '../js/data/sentences.js';
import { allBookPhrases } from '../js/data/books.js';
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

  // The displayed prompt can come from SENTENCES OR from any book page,
  // since wordPicture.js combines both sources. The test must cover the
  // same combined pool the production code draws from — otherwise it's
  // flaky depending on what Math.random() picks.
  const text = root.querySelector('.prompt').textContent;
  const pool = [...SENTENCES, ...allBookPhrases()];
  const target = pool.find((s) => s.text === text);
  assert.ok(target, `displayed sentence "${text}" should match a known sentence or book phrase`);
  const cards = Array.from(root.querySelectorAll('.scene-card'));
  const correct = cards.find((c) => c.getAttribute('aria-label') === target.sceneId);
  assert.ok(correct, `expected a card with aria-label "${target.sceneId}"`);
  correct.click();
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), '1');
  unmount();
});

test('pool includes book phrases (coverage for book-reinforcement design)', () => {
  // Explicit guard: if someone removes book phrases from the pool, this
  // test should fail loudly rather than silently regressing.
  const bookPhrases = allBookPhrases();
  assert.ok(bookPhrases.length > 0, 'books must contribute phrases');
  // Run pickRound many times and confirm at least one pick comes from a book.
  let sawBookPhrase = false;
  for (let i = 0; i < 100; i++) {
    const r = pickRound();
    if (bookPhrases.some((p) => p.text === r.target.text && p.sceneId === r.target.sceneId)) {
      sawBookPhrase = true;
      break;
    }
  }
  assert.ok(sawBookPhrase, 'pickRound() should sometimes return a book phrase');
});

test('wrong scene card does NOT award a star', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  const text = root.querySelector('.prompt').textContent;
  const pool = [...SENTENCES, ...allBookPhrases()];
  const target = pool.find((s) => s.text === text);
  const cards = Array.from(root.querySelectorAll('.scene-card'));
  const wrong = cards.find((c) => c.getAttribute('aria-label') !== target.sceneId);
  wrong.click();
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), null);
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
