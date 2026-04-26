// Daily reading streak — increments when the child opens the app on
// consecutive days; resets if a day is missed. Streak is also a stat
// that some badges check (3-day, 7-day).

import { bumpStat, getStats } from './badges.js';

const KEY = 'kpr.streak';

function todayKey(date = new Date()) {
  // Local date "YYYY-MM-DD" — avoid timezone surprises in localStorage.
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dayDelta(prev, today) {
  // Returns whole days between two YYYY-MM-DD strings (today - prev).
  const a = new Date(prev  + 'T00:00:00');
  const b = new Date(today + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function loadStreak() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}');
  } catch (_) { return {}; }
}

function saveStreak(s) {
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(s)); }
  catch (_) { /* noop */ }
}

/**
 * Tick the streak for the current calendar day.
 *   - First visit ever      → streak = 1
 *   - Same day as last      → no change
 *   - 1 day after last      → streak += 1
 *   - >1 day gap            → streak resets to 1
 *
 * Updates the persisted "streak" stat so the streak badges can fire.
 * Returns the post-tick streak value.
 */
export function tickStreak(today = todayKey()) {
  const s = loadStreak();
  const prev    = s.last;
  const current = s.streak || 0;

  let next;
  if (!prev) {
    next = 1;
  } else if (prev === today) {
    next = current; // same day, no change
  } else if (dayDelta(prev, today) === 1) {
    next = current + 1;
  } else {
    next = 1; // missed a day
  }

  const updated = { last: today, streak: next, longest: Math.max(s.longest || 0, next) };
  saveStreak(updated);

  // Mirror into the stats object so badge checks see it.
  if (prev !== today) {
    const stats = getStats();
    stats.streak = next;
    if (next > (stats.longestStreak || 0)) stats.longestStreak = next;
    try { globalThis.localStorage?.setItem('kpr.stats', JSON.stringify(stats)); }
    catch (_) { /* noop */ }
    // Trigger a stat bump for badge checks (no-op increment).
    bumpStat('streakTouched', 1);
  }

  return next;
}

export function getCurrentStreak() {
  return loadStreak().streak || 0;
}

export function buildStreakChip() {
  const chip = document.createElement('span');
  chip.className = 'streak-chip';
  const n = getCurrentStreak();
  chip.innerHTML = n > 0 ? `🔥 <strong>${n}</strong>` : `🔥 0`;
  chip.title = n > 0 ? `${n}-day reading streak!` : 'Read today to start your streak';
  return chip;
}

// Test seam.
export function _resetStreak() {
  try { globalThis.localStorage?.removeItem(KEY); }
  catch (_) { /* noop */ }
}
