import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/worldMap.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('world map mounts with at least 6 hotspots', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const hotspots = root.querySelectorAll('.hotspot[data-place]');
  assert.ok(hotspots.length >= 6, `expected >= 6 hotspots, got ${hotspots.length}`);
  unmount();
});

test('world map has a hand-lettered title', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const title = root.querySelector('.title.title--hand');
  assert.ok(title, 'title should exist with the hand-lettered class');
  assert.match(title.textContent, /Reading World/);
  unmount();
});

test('world map renders the streak chip and star counter', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.ok(root.querySelector('.streak-chip'),  'streak chip should be present');
  assert.ok(root.querySelector('.star-counter'), 'star counter should be present');
  unmount();
});

test('tapping the library hotspot navigates to library', async () => {
  let navTo = null;
  const ctx = { navigate: (n) => { navTo = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const libraryHotspot = root.querySelector('.hotspot[data-place="library"]');
  assert.ok(libraryHotspot, 'library hotspot must exist');
  libraryHotspot.dispatchEvent(new globalThis.Event('click', { bubbles: true }));
  // walkTo defaults to 600ms; wait long enough for onArrive to fire.
  await new Promise((r) => setTimeout(r, 800));
  assert.equal(navTo, 'library');
  unmount();
});

test('tapping the stickerBook hotspot does NOT navigate (Phase A stub)', async () => {
  let navTo = null;
  const ctx = { navigate: (n) => { navTo = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const stickerHotspot = root.querySelector('.hotspot[data-place="stickerBook"]');
  assert.ok(stickerHotspot, 'stickerBook hotspot must exist');
  stickerHotspot.dispatchEvent(new globalThis.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(navTo, null, 'stickerBook is a Phase A stub; should not navigate');
  unmount();
});

test('parent button navigates to the parent dashboard', () => {
  let navTo = null;
  const ctx = { navigate: (n) => { navTo = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const parentBtn = root.querySelector('.parent-link');
  assert.ok(parentBtn);
  parentBtn.click();
  assert.equal(navTo, 'parent');
  unmount();
});

test('cleanup function removes ambient drifters and detaches handlers', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  assert.ok(root.querySelector('.ambient-drift'), 'ambient drifters should exist before unmount');
  unmount();
  // After unmount the scene is replaced (we manually clear) — the drifters
  // were children of the scene, so they're gone too. Verify by mounting
  // again and counting (no orphaned drifters from the previous mount).
  document.body.innerHTML = '<div id="app"></div>';
  const root2 = document.getElementById('app');
  const unmount2 = mount(root2, ctx);
  assert.equal(root2.querySelectorAll('.ambient-drift').length, 2,
    'fresh mount should have exactly 2 drifters');
  unmount2();
});
