import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getBuddy, setBuddy, hasBuddy,
  buildBuddy, BuddyCorner,
  getUnlockedAccessories, isAccessoryUnlocked, unlockAccessory,
  _resetBuddy,
  NAME_SUGGESTIONS,
} from '../js/components/buddy.js';
import { _resetBadges, bumpStat } from '../js/components/badges.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
  _resetBuddy();
  _resetBadges();
});

test('getBuddy returns sensible defaults when nothing is saved', () => {
  const b = getBuddy();
  assert.equal(b.species, 'koala');
  assert.equal(b.variant, 'classic');
  assert.equal(b.accessory, 'leaf');
  assert.equal(typeof b.name, 'string');
  assert.ok(b.name.length > 0);
});

test('hasBuddy is false until setBuddy is called', () => {
  assert.equal(hasBuddy(), false);
  setBuddy({ species: 'panda', variant: 'pinky', accessory: 'bow', name: 'Bo' });
  assert.equal(hasBuddy(), true);
});

test('setBuddy persists and fires buddy:changed', () => {
  let captured = null;
  document.addEventListener('buddy:changed', (e) => { captured = e.detail.buddy; }, { once: true });
  setBuddy({ species: 'panda', variant: 'pinky', accessory: 'bow', name: 'Bo' });
  const b = getBuddy();
  assert.equal(b.species, 'panda');
  assert.equal(b.variant, 'pinky');
  assert.equal(b.accessory, 'bow');
  assert.equal(b.name, 'Bo');
  assert.ok(captured, 'buddy:changed should have fired');
  assert.equal(captured.species, 'panda');
});

test('buildBuddy returns an SVG with the right species class', () => {
  setBuddy({ species: 'panda', variant: 'classic', accessory: 'bamboo', name: 'Bo' });
  const svg = buildBuddy({ size: 'tall' });
  assert.ok(svg.classList.contains('character'));
  assert.ok(svg.classList.contains('panda'));
});

test('buildBuddy strips an accessory the kid has not unlocked', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'crown', name: 'Koko' });
  // crown requires booksRead >= 3; kid has 0
  const svg = buildBuddy({ size: 'medium' });
  // The accessory <g class="accessory crown"> should NOT appear.
  assert.equal(svg.querySelector('.accessory.crown'), null);
});

test('buildBuddy renders a stat-unlocked accessory once the threshold is met', () => {
  setBuddy({ species: 'koala', variant: 'classic', accessory: 'crown', name: 'Koko' });
  bumpStat('booksRead', 3); // crown unlock
  const svg = buildBuddy({ size: 'medium' });
  assert.ok(svg.querySelector('.accessory.crown'),
    'crown should render once booksRead reaches 3');
});

test('default accessories appear in the unlocked list immediately', () => {
  const ids = new Set(getUnlockedAccessories());
  for (const def of ['leaf', 'hat', 'bamboo', 'bow']) {
    assert.ok(ids.has(def), `${def} should be unlocked by default`);
  }
});

test('unlockAccessory is idempotent and fires buddy:unlock once', () => {
  let count = 0;
  document.addEventListener('buddy:unlock', () => { count += 1; });
  // crown is stat-gated so it's not unlocked by default.
  // But unlockAccessory force-adds it; the event should fire once.
  assert.equal(unlockAccessory('crown'), true,  'first call should unlock');
  assert.equal(unlockAccessory('crown'), false, 'second call should be a no-op');
  assert.equal(count, 1, 'event should fire exactly once');
  assert.ok(isAccessoryUnlocked('crown'));
});

test('unlockAccessory rejects unknown ids', () => {
  assert.equal(unlockAccessory('not-a-real-accessory'), false);
});

test('BuddyCorner returns an HTMLElement with the right class', () => {
  const corner = BuddyCorner({ size: 'chibi' });
  assert.ok(corner instanceof globalThis.HTMLElement);
  assert.ok(corner.classList.contains('buddy-corner'));
  assert.ok(corner.querySelector('svg.character'),
    'corner should contain a buddy svg');
});

test('NAME_SUGGESTIONS is a non-empty list of strings', () => {
  assert.ok(Array.isArray(NAME_SUGGESTIONS));
  assert.ok(NAME_SUGGESTIONS.length >= 4);
  for (const n of NAME_SUGGESTIONS) {
    assert.equal(typeof n, 'string');
    assert.ok(n.length > 0);
  }
});
