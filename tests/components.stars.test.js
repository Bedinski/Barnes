import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getStarCount, setStarCount, resetStars, rewardStar, buildStarCounter,
} from '../js/components/stars.js';

beforeEach(() => {
  globalThis.localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
});

test('getStarCount() defaults to 0', () => {
  assert.equal(getStarCount(), 0);
});

test('rewardStar() increments and persists', () => {
  assert.equal(rewardStar({ x: 100, y: 100 }), 1);
  assert.equal(rewardStar({ x: 100, y: 100 }), 2);
  assert.equal(getStarCount(), 2);
  assert.equal(globalThis.localStorage.getItem('kpr.stars'), '2');
});

test('rewardStar() inserts a fly-star element that auto-removes', async () => {
  rewardStar({ x: 50, y: 50 });
  assert.equal(document.querySelectorAll('.fly-star').length, 1);
  await new Promise((r) => setTimeout(r, 1300));
  assert.equal(document.querySelectorAll('.fly-star').length, 0);
});

test('rewardStar() fires a stars:changed event', () => {
  let count = -1;
  const onChange = (e) => { count = e.detail.count; };
  document.addEventListener('stars:changed', onChange);
  rewardStar({ x: 50, y: 50 });
  document.removeEventListener('stars:changed', onChange);
  assert.equal(count, 1);
});

test('resetStars() zeroes out and notifies', () => {
  setStarCount(5);
  let count = -1;
  const onChange = (e) => { count = e.detail.count; };
  document.addEventListener('stars:changed', onChange);
  resetStars();
  document.removeEventListener('stars:changed', onChange);
  assert.equal(getStarCount(), 0);
  assert.equal(count, 0);
});

test('buildStarCounter() reflects current count and updates on event', () => {
  setStarCount(3);
  const el = buildStarCounter();
  assert.match(el.innerHTML, /3/);
  rewardStar({ x: 0, y: 0 });
  assert.match(el.innerHTML, /4/);
});
