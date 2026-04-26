import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  BADGES, getStats, bumpStat, checkBadges,
  getEarnedBadgeIds, isEarned, buildBadgeGallery, _resetBadges,
} from '../js/components/badges.js';

beforeEach(() => {
  _resetBadges();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('BADGES list has stable structure (id, label, emoji, hint, when)', () => {
  assert.ok(BADGES.length >= 6, 'at least 6 badges shipped');
  for (const b of BADGES) {
    assert.match(b.id, /^[a-z0-9-]+$/);
    assert.ok(b.label.length > 0);
    assert.ok(b.emoji.length > 0);
    assert.ok(b.hint.length > 0);
    assert.equal(typeof b.when, 'function');
  }
  // Ids unique.
  const ids = BADGES.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('getStats() returns zeros for a fresh user', () => {
  const s = getStats();
  assert.equal(s.booksRead,   0);
  assert.equal(s.pagesRead,   0);
  assert.equal(s.wordsTapped, 0);
  assert.equal(s.rounds,      0);
});

test('bumpStat increments the named counter and persists', () => {
  bumpStat('booksRead', 1);
  bumpStat('booksRead', 1);
  bumpStat('wordsTapped', 5);
  const s = getStats();
  assert.equal(s.booksRead,   2);
  assert.equal(s.wordsTapped, 5);
});

test('First Book badge fires after booksRead reaches 1', () => {
  assert.equal(isEarned('first-book'), false);
  bumpStat('booksRead', 1);
  assert.equal(isEarned('first-book'), true);
});

test('Word Tapper badge fires after 25 word taps', () => {
  for (let i = 0; i < 24; i++) bumpStat('wordsTapped', 1);
  assert.equal(isEarned('word-tapper'), false);
  bumpStat('wordsTapped', 1);
  assert.equal(isEarned('word-tapper'), true);
});

test('checkBadges fires "badges:earned" event with the new badges', () => {
  const fired = [];
  document.addEventListener('badges:earned', (e) => fired.push(e.detail.badges.map((b) => b.id)));
  bumpStat('booksRead', 1);
  // Should have fired with first-book.
  assert.ok(fired.length >= 1);
  assert.ok(fired[0].includes('first-book'));
});

test('a badge does not re-fire — earned badge ids are deduped', () => {
  bumpStat('booksRead', 1);                 // earns First Book
  const after = getEarnedBadgeIds();
  // Trigger checkBadges several more times with the SAME stat already at
  // its first-book threshold — first-book must not be added again.
  bumpStat('starsAwarded', 1);
  bumpStat('starsAwarded', 1);
  const dedup = getEarnedBadgeIds();
  // The first badge id should appear exactly once across all the array.
  const firstBookCount = dedup.filter((id) => id === 'first-book').length;
  assert.equal(firstBookCount, 1, 'first-book must appear exactly once');
  // We may earn additional badges (none for this test), but never lose
  // the earlier one.
  for (const id of after) assert.ok(dedup.includes(id));
});

test('buildBadgeGallery renders one chip per badge with locked/earned state', () => {
  bumpStat('booksRead', 1);     // earn first-book
  const gal = buildBadgeGallery();
  document.body.appendChild(gal);
  const chips = gal.querySelectorAll('.badge-chip');
  assert.equal(chips.length, BADGES.length);
  const earned = gal.querySelectorAll('.badge-chip.is-earned');
  const locked = gal.querySelectorAll('.badge-chip.is-locked');
  assert.equal(earned.length, 1);
  assert.equal(locked.length, BADGES.length - 1);
});

test('Master Reader fires after 5 mastered pages (re-reading reward)', () => {
  for (let i = 0; i < 5; i++) bumpStat('pagesMastered', 1);
  assert.equal(isEarned('master-reader'), true);
});
