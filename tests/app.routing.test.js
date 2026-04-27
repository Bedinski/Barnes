import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../js/app.js';
import { BOOKS } from '../js/data/books.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('createApp() mounts the home (world-map) scene immediately', () => {
  const root = document.getElementById('app');
  createApp(root);
  // Phase A: the home slot is now the world-map hub.
  assert.ok(root.querySelector('.scene.world-map'));
});

test('navigating to library swaps in the library scene', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('library');
  assert.ok(root.querySelector('.scene.library'));
  assert.equal(root.querySelector('.scene.world-map'), null);
});

test('navigating to reader with a bookId swaps in the reader scene', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('reader', { bookId: BOOKS[0].id });
  assert.ok(root.querySelector('.scene.reader'));
});

test('navigating to wordPicture swaps in the word-picture scene', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('wordPicture');
  assert.ok(root.querySelector('.scene.word-picture'));
});

test('navigating to buildSentence swaps in the build-sentence scene', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('buildSentence');
  assert.ok(root.querySelector('.scene.build-sentence'));
});

test('round-trip back to home unmounts the previous scene', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('library');
  ctx.navigate('home');
  assert.ok(root.querySelector('.scene.world-map'));
  assert.equal(root.querySelector('.scene.library'), null);
});

test('unknown scene name falls back to home', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('does-not-exist');
  assert.ok(root.querySelector('.scene.world-map'));
});
