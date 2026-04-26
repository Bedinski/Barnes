import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  tickStreak, getCurrentStreak, buildStreakChip, _resetStreak, loadStreak,
} from '../js/components/streak.js';
import { _resetBadges, getStats } from '../js/components/badges.js';

beforeEach(() => {
  _resetStreak();
  _resetBadges();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('first ever tick sets streak to 1', () => {
  assert.equal(tickStreak('2026-04-26'), 1);
  assert.equal(getCurrentStreak(), 1);
});

test('same-day re-tick keeps the streak unchanged', () => {
  tickStreak('2026-04-26');
  assert.equal(tickStreak('2026-04-26'), 1);
  assert.equal(getCurrentStreak(), 1);
});

test('next-day tick increments the streak', () => {
  tickStreak('2026-04-26');
  assert.equal(tickStreak('2026-04-27'), 2);
  assert.equal(tickStreak('2026-04-28'), 3);
});

test('skipping a day resets the streak to 1', () => {
  tickStreak('2026-04-26');
  tickStreak('2026-04-27');
  assert.equal(tickStreak('2026-04-29'), 1, 'gap of 2 days resets');
});

test('longest streak is tracked across resets', () => {
  tickStreak('2026-04-26');
  tickStreak('2026-04-27');
  tickStreak('2026-04-28');
  tickStreak('2026-04-30'); // resets to 1
  const s = loadStreak();
  assert.equal(s.streak,  1);
  assert.equal(s.longest, 3);
});

test('streak is mirrored into stats so streak-3 / streak-7 badges can fire', () => {
  tickStreak('2026-04-26');
  tickStreak('2026-04-27');
  tickStreak('2026-04-28');
  const stats = getStats();
  assert.equal(stats.streak, 3);
});

test('buildStreakChip shows the current count', () => {
  tickStreak('2026-04-26');
  tickStreak('2026-04-27');
  const chip = buildStreakChip();
  assert.match(chip.textContent, /2/);
});
