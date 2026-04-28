// Buddy module (Phase B). Owns the kid's chosen reading buddy:
// species, fur variant, equipped accessory, and name. Persists in
// localStorage under kpr.buddy. The unlocked-accessory set lives
// separately under kpr.buddyAccessories so unlock state survives
// re-customization.
//
// Public API:
//   getBuddy()                       → { species, variant, accessory, name }
//   setBuddy(partial)                → merges + saves + fires 'buddy:changed'
//   buildBuddy({ size })             → SVG for the configured buddy
//   BuddyCorner({ size })            → HTMLElement floating corner buddy
//   getUnlockedAccessories()         → string[] of ids the kid can equip now
//   isAccessoryUnlocked(id)          → bool
//   unlockAccessory(id)              → adds to set + fires 'buddy:unlock'
//   _resetBuddy()                    → test seam
//
// Defaults: a friendly koala named "Koko" with the leaf. Returning a
// valid default from getBuddy() means existing scene tests that never
// seed kpr.buddy keep working.

import { buildKoala } from '../characters/koala.js?v=6';
import { buildPanda } from '../characters/panda.js?v=6';
import { attach as animate } from '../characters/animator.js';
import { getStats } from './badges.js';
import { ACCESSORIES, accessoriesForSpecies } from '../data/accessories.js';

const KEY_BUDDY        = 'kpr.buddy';
const KEY_UNLOCKS      = 'kpr.buddyAccessories';

const DEFAULT_BUDDY = Object.freeze({
  species:   'koala',   // legacy id — renders as Shark Hero
  variant:   'classic',
  accessory: 'leaf',    // legacy id — renders as Hero Emblem
  name:      'Finn',
});

// Stable list of name suggestions for the onboarding picker. Sea-hero
// themed; order is preserved so the auto-name button can rotate
// through deterministically.
export const NAME_SUGGESTIONS = [
  'Finn', 'Bo', 'Reef', 'Tide', 'Splash', 'Coral', 'Pearl', 'Marina',
];

function readJSON(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw == null) return fallback;
    const v = JSON.parse(raw);
    return (v == null) ? fallback : v;
  } catch (_) { return fallback; }
}

function writeJSON(key, value) {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); }
  catch (_) { /* noop */ }
}

export function getBuddy() {
  const stored = readJSON(KEY_BUDDY, null);
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_BUDDY };
  return { ...DEFAULT_BUDDY, ...stored };
}

export function hasBuddy() {
  // Distinguishes "first launch, never picked a buddy" from "picked it
  // once". App.js routes to onboarding only on first launch.
  return readJSON(KEY_BUDDY, null) != null;
}

export function setBuddy(partial) {
  const next = { ...getBuddy(), ...(partial || {}) };
  writeJSON(KEY_BUDDY, next);
  try {
    document.dispatchEvent(new CustomEvent('buddy:changed', { detail: { buddy: next } }));
  } catch (_) { /* noop */ }
  return next;
}

// ---------- Accessory unlocks ----------
function readUnlockSet() {
  const fromStorage = readJSON(KEY_UNLOCKS, []);
  const set = new Set(Array.isArray(fromStorage) ? fromStorage : []);
  // Defaults are always available (don't need to be persisted).
  for (const a of ACCESSORIES) {
    if (a.unlock?.type === 'default') set.add(a.id);
  }
  // Stat-gated unlocks are derived from current stats so they can't
  // get out of sync with reality. Cheap to compute on read.
  const stats = getStats();
  for (const a of ACCESSORIES) {
    if (a.unlock?.type === 'stat'
        && (stats[a.unlock.key] || 0) >= a.unlock.n) {
      set.add(a.id);
    }
  }
  return set;
}

export function getUnlockedAccessories() {
  return Array.from(readUnlockSet());
}

export function isAccessoryUnlocked(id) {
  return readUnlockSet().has(id);
}

export function unlockAccessory(id) {
  if (!ACCESSORIES.find((a) => a.id === id)) return false;
  const persisted = new Set(readJSON(KEY_UNLOCKS, []));
  if (persisted.has(id)) return false;
  persisted.add(id);
  writeJSON(KEY_UNLOCKS, Array.from(persisted));
  try {
    document.dispatchEvent(new CustomEvent('buddy:unlock', { detail: { accessoryId: id } }));
  } catch (_) { /* noop */ }
  return true;
}

// ---------- Renderers ----------
const SIZE_DIMS = {
  chibi:  { w: 72,  h: 86  },
  small:  { w: 110, h: 132 },
  medium: { w: 170, h: 198 },
  tall:   { w: 220, h: 260 },
};

export function buildBuddy({ size = 'medium', overrides = {} } = {}) {
  const b = { ...getBuddy(), ...overrides };
  // Don't render an accessory the kid hasn't unlocked (e.g., when a
  // stat regresses or the unlock set is cleared).
  let acc = b.accessory;
  if (acc && !isAccessoryUnlocked(acc)) acc = null;
  // Don't render an accessory that isn't valid for this species (e.g.,
  // 'leaf' on a panda after a species swap).
  if (acc) {
    const validIds = accessoriesForSpecies(b.species).map((a) => a.id);
    if (!validIds.includes(acc)) acc = null;
  }
  const opts = { variant: b.variant, accessory: acc, size };
  return b.species === 'panda' ? buildPanda(opts) : buildKoala(opts);
}

export function BuddyCorner({ size = 'chibi', position = 'top-right' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = `buddy-corner buddy-corner--${position} size-${size}`;
  wrap.setAttribute('aria-hidden', 'true');
  const dims = SIZE_DIMS[size] || SIZE_DIMS.chibi;
  wrap.style.width  = `${dims.w}px`;
  wrap.style.height = `${dims.h}px`;

  let svg = buildBuddy({ size });
  wrap.appendChild(svg);
  let handle = animate(svg);
  setTimeout(() => { try { handle.wave(); } catch (_) {} }, 250);

  // Re-render on buddy:changed so the corner buddy stays in sync after
  // the kid edits in the closet.
  const onChange = () => {
    try { handle.detach(); } catch (_) {}
    wrap.innerHTML = '';
    svg = buildBuddy({ size });
    wrap.appendChild(svg);
    handle = animate(svg);
  };
  document.addEventListener('buddy:changed', onChange);

  // Expose detach for scene cleanup. The scene unmount won't typically
  // call this directly (the wrap is just removed with the rest of the
  // scene tree), but tests can call it for hygiene.
  wrap._detach = () => {
    document.removeEventListener('buddy:changed', onChange);
    try { handle.detach(); } catch (_) {}
  };
  return wrap;
}

// Test seam — clears the buddy + unlocks. Defaults survive.
export function _resetBuddy() {
  try {
    globalThis.localStorage?.removeItem(KEY_BUDDY);
    globalThis.localStorage?.removeItem(KEY_UNLOCKS);
  } catch (_) { /* noop */ }
}
