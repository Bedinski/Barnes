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

test('createApp() mounts the home scene immediately', () => {
  const root = document.getElementById('app');
  createApp(root);
  assert.ok(root.querySelector('.scene.home'));
});

test('navigating to library swaps in the library scene', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('library');
  assert.ok(root.querySelector('.scene.library'));
  assert.equal(root.querySelector('.scene.home'), null);
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
  assert.ok(root.querySelector('.scene.home'));
  assert.equal(root.querySelector('.scene.library'), null);
});

test('unknown scene name falls back to home', () => {
  const root = document.getElementById('app');
  const ctx = createApp(root);
  ctx.navigate('does-not-exist');
  assert.ok(root.querySelector('.scene.home'));
});
