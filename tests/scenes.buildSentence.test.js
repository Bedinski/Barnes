import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount, pickRound } from '../js/scenes/buildSentence.js';
import { SENTENCES, tokenize } from '../js/data/sentences.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('pickRound() returns shuffled words equal to target tokens', () => {
  const r = pickRound(SENTENCES);
  const tokens = tokenize(r.target.text);
  assert.deepEqual(r.targetWords, tokens);
  assert.equal(r.shuffled.length, tokens.length);
  assert.deepEqual(r.shuffled.slice().sort(), tokens.slice().sort());
});

test('mount() renders one slot per word and one tile per word', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  const slots = root.querySelectorAll('.slot');
  const tiles = root.querySelectorAll('.tile');
  assert.ok(slots.length > 0);
  assert.equal(slots.length, tiles.length);
  unmount();
});

test('tapping a tile fills the next empty slot, tile leaves the tray', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  const tile = root.querySelector('.tile');
  const word = tile.dataset.word;
  tile.click();
  const firstSlot = root.querySelector('.slot');
  assert.equal(firstSlot.dataset.word, word);
  assert.equal(firstSlot.textContent, word);
  // Tile should be removed from tray
  assert.equal(root.querySelector(`.tile[data-word="${word}"]`), null);
  unmount();
});

test('tapping a filled slot returns the tile to the tray', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  const tile = root.querySelector('.tile');
  const word = tile.dataset.word;
  tile.click();
  const slot = root.querySelector('.slot');
  slot.click();
  assert.equal(slot.dataset.word, '');
  assert.equal(slot.textContent, '');
  assert.ok(root.querySelector(`.tile[data-word="${word}"]`));
  unmount();
});

test('placing all tiles in correct order awards a star', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);

  // Read the target by inspecting tiles and matching against a known sentence.
  const tiles = Array.from(root.querySelectorAll('.tile'));
  const tileWords = tiles.map((t) => t.dataset.word);
  // Target sentence is the one whose tokens match the multiset of tile words.
  const target = SENTENCES.find((s) => {
    const ts = tokenize(s.text);
    return ts.length === tileWords.length
      && ts.slice().sort().join(' ') === tileWords.slice().sort().join(' ');
  });
  assert.ok(target, 'should find the target sentence by tile contents');
  const order = tokenize(target.text);

  // Click tiles in target order
  for (const w of order) {
    const tile = root.querySelector(`.tile[data-word="${CSS_escape(w)}"]`);
    assert.ok(tile, `missing tile for "${w}"`);
    tile.click();
  }
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), '1');
  unmount();
});

// Minimal CSS.escape polyfill — JSDOM may not have it for all selectors.
function CSS_escape(s) { return s.replace(/(["\\])/g, '\\$1'); }
