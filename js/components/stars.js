// Star reward component. Persists count in localStorage and animates
// a fly-up star at the source coordinates so the child sees their reward
// "come from" wherever they tapped.
//
// Every awarded star also bumps the badges-system "starsAwarded" stat so
// the Star Saver badge fires correctly. Imported lazily to avoid a circular
// dependency (badges.js → stars.js for rewardStar).

const KEY = 'kpr.stars';

let bumpStatRef = null;
async function ensureBumpStat() {
  if (bumpStatRef) return bumpStatRef;
  try {
    const mod = await import('./badges.js');
    bumpStatRef = mod.bumpStat;
  } catch (_) { bumpStatRef = () => {}; }
  return bumpStatRef;
}

export function getStarCount() {
  try {
    return parseInt(globalThis.localStorage?.getItem(KEY) ?? '0', 10) || 0;
  } catch (_) {
    return 0;
  }
}

export function setStarCount(n) {
  try {
    globalThis.localStorage?.setItem(KEY, String(n));
  } catch (_) { /* localStorage may be blocked — ignore */ }
}

export function resetStars() {
  setStarCount(0);
  document.dispatchEvent(new CustomEvent('stars:changed', { detail: { count: 0 } }));
}

/**
 * Award a star, animate it flying up from (x, y) on screen, persist the
 * new count, and fire a `stars:changed` event so the topbar can update.
 * @param {{x?:number, y?:number, container?:HTMLElement}} [opts]
 * @returns {number} new count
 */
export function rewardStar(opts = {}) {
  const next = getStarCount() + 1;
  setStarCount(next);

  const x = opts.x ?? (globalThis.innerWidth || 800) / 2;
  const y = opts.y ?? (globalThis.innerHeight || 600) / 2;

  const el = document.createElement('div');
  el.className = 'fly-star';
  el.textContent = '⭐';
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  (opts.container || document.body).appendChild(el);
  setTimeout(() => el.remove(), 1200);

  document.dispatchEvent(new CustomEvent('stars:changed', { detail: { count: next } }));
  // Fire-and-forget bump of the badges stat (won't block rendering).
  ensureBumpStat().then((bump) => bump('starsAwarded', 1));
  return next;
}

export function buildStarCounter() {
  // Render as a button so it's obviously tappable. Tap = pulse + speech
  // ("You have 7 stars!") so the kid sees AND hears their reward count
  // when they're curious.
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'star-counter';
  btn.setAttribute('aria-label', 'Stars earned');
  const update = (n) => {
    btn.innerHTML = `⭐ <strong>${n}</strong>`;
    btn.setAttribute('aria-label', `${n} stars earned. Tap to hear.`);
  };
  update(getStarCount());
  document.addEventListener('stars:changed', (e) => update(e.detail.count));

  btn.addEventListener('click', async () => {
    btn.classList.remove('is-pulse');
    void btn.offsetWidth;
    btn.classList.add('is-pulse');
    const n = getStarCount();
    // Lazy-import speak/tap so this module stays free of side-effect loops.
    try {
      const [{ speak }, { tap }] = await Promise.all([
        import('../audio/speech.js'),
        import('../audio/sounds.js'),
      ]);
      tap();
      const msg = n === 0 ? 'No stars yet. Read a book to earn one!'
        : n === 1 ? 'You have 1 star!'
        : `You have ${n} stars!`;
      speak(msg);
    } catch (_) { /* ignore in test env */ }
  });
  return btn;
}
