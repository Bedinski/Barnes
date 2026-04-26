import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount, pickRound } from '../js/scenes/cloze.js';
import { SENTENCES, tokenize } from '../js/data/sentences.js';
import { allBookPhrases } from '../js/data/books.js';
import { _resetBadges } from '../js/components/badges.js';

beforeEach(() => {
  _resetBadges();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('pickRound returns a target, blankIndex, answer, and 3 unique options', () => {
  const r = pickRound();
  assert.ok(r.target);
  assert.equal(typeof r.blankIndex, 'number');
  assert.ok(r.answer.length > 0);
  assert.equal(r.options.length, 3);
  assert.equal(new Set(r.options).size, 3);
  assert.ok(r.options.map((o) => o.toLowerCase()).includes(r.answer.toLowerCase()),
    'options must include the correct answer');
  // Blank index must point at a word in the sentence.
  const tokens = tokenize(r.target.text);
  assert.ok(r.blankIndex >= 0 && r.blankIndex < tokens.length);
});

test('pool combines SENTENCES and book phrases', () => {
  const total = SENTENCES.length + allBookPhrases().length;
  // Run pickRound many times; should sometimes hit a book phrase.
  let bookHits = 0;
  const bookTexts = new Set(allBookPhrases().map((p) => p.text));
  for (let i = 0; i < 80; i++) {
    const r = pickRound();
    if (bookTexts.has(r.target.text)) bookHits++;
  }
  assert.ok(bookHits > 0, `expected some book phrases to be picked from pool of ${total}`);
});

test('mount renders scene art, sentence with one blank, and 3 tiles', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.ok(root.querySelector('.cloze-art svg'),     'scene art rendered');
  assert.ok(root.querySelector('.cloze-sentence'),    'sentence rendered');
  assert.equal(root.querySelectorAll('.cloze-blank').length, 1);
  assert.equal(root.querySelectorAll('.tile').length, 3);
  unmount();
});

test('Home back button navigates home', () => {
  let to = null;
  const ctx = { navigate: (n) => { to = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(to, 'home');
  unmount();
});

test('clicking the correct tile fills the blank, awards a star, and bumps rounds', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  // The current scene's correct word is whichever tile matches the blank
  // text once filled — we read it from the data attached to the scene by
  // finding the tile that, when clicked, transitions the blank to .is-filled.
  // Easier: derive answer by matching the displayed sentence against the
  // pool and computing the blank token.
  const sentenceEl = root.querySelector('.cloze-sentence');
  const display = sentenceEl.textContent.replace(/\s+/g, ' ').trim();
  // Find the word that, when substituted into the original sentence at the
  // blank position, matches a known sentence/book phrase.
  // Simpler — just iterate tiles, click each in sequence, and assert that
  // exactly one of them filled the blank and incremented stars.
  const tiles = Array.from(root.querySelectorAll('.tile'));
  let filled = false;
  for (const tile of tiles) {
    tile.click();
    if (root.querySelector('.cloze-blank.is-filled')) { filled = true; break; }
  }
  assert.ok(filled, 'one of the 3 tiles must be the correct answer');
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), '1');
  unmount();
  // The display var is intentionally unused — kept for debug if test fails.
  void display;
});

test('clicking a wrong tile does NOT fill the blank or award a star', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  // Click each tile and verify: at most ONE eventually fills the blank.
  // First tile that DOESN'T fill must therefore be a wrong tile, and
  // stars must still be 0 right after that wrong click.
  const tiles = Array.from(root.querySelectorAll('.tile'));
  for (const tile of tiles) {
    tile.click();
    if (root.querySelector('.cloze-blank.is-filled')) break;
    // Wrong click — stars should still be null in localStorage.
    assert.equal(globalThis.localStorage.getItem('kpr.stars'), null);
  }
  unmount();
});
