// Achievement badges system. Persists earned badge IDs in localStorage and
// fires a celebratory toast + sound when a new one is unlocked.
//
// Designed for evidence-backed motivation: badges + streaks measurably
// boost retention in literacy apps (see Beanstack reading-rewards
// research). Each badge has a clear, kid-readable goal so the child knows
// what they're working toward.

import { rewardStar } from './stars.js';
import { speak } from '../audio/speech.js';
import { success } from '../audio/sounds.js';

const KEY_BADGES = 'kpr.badges';
const KEY_STATS  = 'kpr.stats';

// Aggregate stats persisted across sessions. Used by checkBadges().
function loadStats() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY_STATS) || '{}');
  } catch (_) { return {}; }
}

function saveStats(s) {
  try { globalThis.localStorage?.setItem(KEY_STATS, JSON.stringify(s)); }
  catch (_) { /* noop */ }
}

export function getStats() {
  return {
    booksRead:   0,
    pagesRead:   0,
    wordsTapped: 0,
    rounds:      0,    // correct rounds in any game mode
    ...loadStats(),
  };
}

export function bumpStat(key, by = 1) {
  const s = getStats();
  s[key] = (s[key] || 0) + by;
  saveStats(s);
  checkBadges(s);
  return s[key];
}

// Each badge: { id, label, emoji, hint, when(stats) → bool }
// `hint` shows up as a kid-readable goal in the badge gallery.
export const BADGES = [
  { id: 'first-book',   emoji: '📖', label: 'First Book!',     hint: 'Read 1 book all the way through',     when: (s) => s.booksRead   >= 1 },
  { id: 'word-tapper',  emoji: '👆', label: 'Word Tapper',     hint: 'Tap 25 words to hear them',           when: (s) => s.wordsTapped >= 25 },
  { id: 'star-saver',   emoji: '⭐', label: 'Star Saver',      hint: 'Earn 10 stars',                       when: (s) => s.starsAwarded>= 10 },
  { id: 'bookworm',     emoji: '🐛', label: 'Bookworm',        hint: 'Read all 3 books',                    when: (s) => s.booksRead   >= 3 },
  { id: 'super-reader', emoji: '🦸', label: 'Super Reader',    hint: 'Finish 10 reading rounds',            when: (s) => s.rounds      >= 10 },
  { id: 'streak-3',     emoji: '🔥', label: '3-Day Streak',    hint: 'Read 3 days in a row',                when: (s) => (s.streak || 0) >= 3 },
  { id: 'streak-7',     emoji: '🌟', label: '7-Day Streak',    hint: 'Read 7 days in a row',                when: (s) => (s.streak || 0) >= 7 },
  { id: 'master-reader',emoji: '🏆', label: 'Master Reader',   hint: 'Master 5 book pages (read 3× each)',  when: (s) => (s.pagesMastered || 0) >= 5 },
];

export function getEarnedBadgeIds() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY_BADGES) || '[]');
  } catch (_) { return []; }
}

function setEarnedBadgeIds(ids) {
  try { globalThis.localStorage?.setItem(KEY_BADGES, JSON.stringify(ids)); }
  catch (_) { /* noop */ }
}

export function isEarned(id) {
  return getEarnedBadgeIds().includes(id);
}

// Check stats against every badge; unlock new ones; show toast + speak
// the label for each.  Returns the array of newly-earned badges.
export function checkBadges(stats = getStats()) {
  const earned = new Set(getEarnedBadgeIds());
  const fresh  = [];
  for (const b of BADGES) {
    if (!earned.has(b.id) && b.when(stats)) {
      earned.add(b.id);
      fresh.push(b);
    }
  }
  if (fresh.length) {
    setEarnedBadgeIds([...earned]);
    document.dispatchEvent(new CustomEvent('badges:earned', { detail: { badges: fresh } }));
    showBadgeToasts(fresh);
    // Phase B: each new badge may also unlock a buddy accessory.
    // Dynamic import avoids a static cycle: buddy.js → badges.js
    // (for getStats) and now badges.js → buddy.js (for unlock).
    import('./buddy.js').then((m) => {
      import('../data/accessories.js').then(({ BADGE_TO_ACCESSORY }) => {
        for (const b of fresh) {
          const accId = BADGE_TO_ACCESSORY?.[b.id];
          if (accId) m.unlockAccessory(accId);
        }
      }).catch(() => {});
    }).catch(() => {});
  }
  return fresh;
}

function showBadgeToasts(badges) {
  badges.forEach((b, i) => {
    setTimeout(() => {
      success();
      const t = document.createElement('div');
      t.className = 'badge-toast';
      t.innerHTML = `<span class="emoji">${b.emoji}</span><div><div class="label">New badge!</div><div class="name">${b.label}</div></div>`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3500);
      speak(`New badge! ${b.label}!`);
      rewardStar();
    }, i * 1800);
  });
}

// Pop a tooltip-style label below the tapped chip so the kid sees
// immediate visual proof their tap registered. Auto-removes.
function showBadgePopover(anchor, badge, earned) {
  // Remove any existing popover first.
  document.querySelectorAll('.badge-popover').forEach((p) => p.remove());
  const pop = document.createElement('div');
  pop.className = 'badge-popover';
  pop.innerHTML = `
    <span class="pop-emoji">${badge.emoji}</span>
    <span class="pop-name">${badge.label}</span>
    <span class="pop-hint">${earned ? '✓ Earned!' : badge.hint}</span>
  `;
  document.body.appendChild(pop);
  // Position centered below the chip, clamped inside the viewport.
  const rect = anchor.getBoundingClientRect();
  const top  = rect.bottom + 8;
  const left = Math.max(60, Math.min((globalThis.innerWidth || 800) - 60, rect.left + rect.width / 2));
  pop.style.left = `${left}px`;
  pop.style.top  = `${top}px`;
  setTimeout(() => pop.remove(), 2200);
}

// Topbar gallery — a row of chips, lit-up if earned, faded if not.
export function buildBadgeGallery() {
  const wrap = document.createElement('div');
  wrap.className = 'badge-gallery';
  wrap.setAttribute('role', 'list');
  const render = () => {
    wrap.innerHTML = '';
    const earned = new Set(getEarnedBadgeIds());
    BADGES.forEach((b) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `badge-chip ${earned.has(b.id) ? 'is-earned' : 'is-locked'}`;
      chip.setAttribute('aria-label', `${b.label}: ${b.hint}`);
      chip.dataset.badgeId = b.id;
      chip.textContent = b.emoji;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const isEarned = earned.has(b.id);
        // Visible: pulse the chip + show a popover with the label & hint.
        chip.classList.remove('is-pulse');
        // restart animation
        void chip.offsetWidth;
        chip.classList.add('is-pulse');
        showBadgePopover(chip, b, isEarned);
        speak(isEarned ? `${b.label}!` : `${b.label}. ${b.hint}.`);
      });
      wrap.appendChild(chip);
    });
  };
  render();
  document.addEventListener('badges:earned', render);
  return wrap;
}

// Test seam — clears all badge state + stats.
export function _resetBadges() {
  try {
    globalThis.localStorage?.removeItem(KEY_BADGES);
    globalThis.localStorage?.removeItem(KEY_STATS);
  } catch (_) { /* noop */ }
}
