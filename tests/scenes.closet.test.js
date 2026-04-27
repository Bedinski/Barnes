import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/closet.js';
import { setBuddy, getBuddy, _resetBuddy } from '../js/components/buddy.js';
import { _resetBadges, bumpStat } from '../js/components/badges.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
  _resetBuddy();
  _resetBadges();
});

test('closet renders one cell per accessory for the buddy species', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'leaf', name: 'Koko' });
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const cells = root.querySelectorAll('.closet-cell');
  // koala accessories: leaf, hat (defaults) + crown, glasses, scarf, flower (multi-species)
  assert.ok(cells.length >= 6, `expected >= 6 cells, got ${cells.length}`);
  unmount();
});

test('locked accessories cannot be equipped', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'leaf', name: 'Koko' });
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  // crown is stat-gated (booksRead >= 3); kid has 0.
  const crown = root.querySelector('.closet-cell[data-accessory-id="crown"]');
  assert.ok(crown, 'crown cell should render');
  assert.ok(crown.classList.contains('is-locked'), 'crown should start locked');
  crown.click();
  assert.equal(getBuddy().accessory, 'leaf', 'tapping a locked cell must NOT change the equipped accessory');
  unmount();
});

test('tapping an unlocked accessory equips it and re-renders the preview', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'leaf', name: 'Koko' });
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  // hat is a default-unlocked koala accessory.
  const hat = root.querySelector('.closet-cell[data-accessory-id="hat"]');
  hat.click();
  assert.equal(getBuddy().accessory, 'hat', 'hat should now be equipped');
  // Preview should now show the hat accessory <g>.
  assert.ok(root.querySelector('.closet-preview .accessory.hat'),
    'preview should re-render with hat');
  unmount();
});

test('Home back button navigates to worldMap', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'leaf', name: 'Koko' });
  let navTo = null;
  const ctx = { navigate: (n) => { navTo = n; } };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  root.querySelector('.btn--ghost').click();
  assert.equal(navTo, 'worldMap');
  unmount();
});

test('a stat-gated accessory becomes unlocked once its stat threshold is met', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'leaf', name: 'Koko' });
  bumpStat('booksRead', 3); // unlocks crown
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx);
  const crown = root.querySelector('.closet-cell[data-accessory-id="crown"]');
  assert.ok(!crown.classList.contains('is-locked'),
    'crown should now be unlocked');
  unmount();
});
