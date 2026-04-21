// Brings characters to life: idle animations are CSS-driven (already on
// .character base class in styles.css), but JS adds:
//   - look-at-cursor: pupils track the pointer
//   - reaction states: cheer / wiggle / think / wave / sleep
//   - talk-sync: mouth toggles open/closed while speech.js is speaking
// Also exposes idle-pause via IntersectionObserver to save battery on
// offscreen mascots.

const STATE_CLASSES = ['state-cheer', 'state-wiggle', 'state-think', 'state-wave', 'state-sleep'];
const PUPIL_RANGE   = 3;   // max px the pupil can drift inside its eye-white
const TALK_INTERVAL = 140; // ms between mouth toggles while talking

const attached = new WeakSet();
let pointerListener = null;
const liveCharacters = new Set();
let intersectionObs = null;
let speechHookInstalled = false;

function setState(svg, state, durationMs = 0) {
  STATE_CLASSES.forEach((c) => svg.classList.remove(c));
  if (state) svg.classList.add(state);
  if (state && durationMs > 0) {
    setTimeout(() => svg.classList.remove(state), durationMs);
  }
}

function trackPupils(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  // Vector from svg center to pointer, normalized to [-1, 1].
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = (clientX - cx) / rect.width;
  const dy = (clientY - cy) / rect.height;
  const max = 1;
  const nx = Math.max(-max, Math.min(max, dx * 4));
  const ny = Math.max(-max, Math.min(max, dy * 4));
  const ox = nx * PUPIL_RANGE;
  const oy = ny * PUPIL_RANGE;
  svg.querySelectorAll('.pupil').forEach((p) => {
    p.setAttribute('transform', `translate(${ox} ${oy})`);
  });
}

function ensurePointerListener() {
  if (pointerListener || typeof document === 'undefined') return;
  pointerListener = (e) => {
    liveCharacters.forEach((svg) => trackPupils(svg, e.clientX, e.clientY));
  };
  document.addEventListener('pointermove', pointerListener, { passive: true });
}

function ensureIntersectionObs() {
  if (intersectionObs || typeof IntersectionObserver === 'undefined') return;
  intersectionObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const svg = entry.target;
      svg.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });
  });
}

function ensureSpeechHook() {
  if (speechHookInstalled || typeof globalThis.addEventListener !== 'function') return;
  speechHookInstalled = true;
  let timer = null;
  globalThis.addEventListener('speech:start', () => {
    if (timer) clearInterval(timer);
    const speakers = Array.from(document.querySelectorAll('.character.is-speaker'));
    const targets = speakers.length ? speakers : Array.from(document.querySelectorAll('.character'));
    targets.forEach((t) => t.classList.add('is-talking'));
    let toggle = true;
    timer = setInterval(() => {
      toggle = !toggle;
      targets.forEach((t) => t.classList.toggle('is-talking', toggle));
    }, TALK_INTERVAL);
  });
  globalThis.addEventListener('speech:end', () => {
    if (timer) { clearInterval(timer); timer = null; }
    document.querySelectorAll('.character.is-talking')
      .forEach((t) => t.classList.remove('is-talking'));
  });
}

/**
 * Bring a character SVG to life. Idempotent — safe to call repeatedly.
 * @param {SVGElement} svg
 * @param {{idleSleepAfterMs?: number}} [opts]
 * @returns {{cheer:Function,wiggle:Function,think:Function,wave:Function,sleep:Function,wake:Function,setSpeaker:Function,detach:Function}}
 */
export function attach(svg, opts = {}) {
  if (!svg) throw new Error('animator.attach: svg is required');
  if (!attached.has(svg)) {
    attached.add(svg);
    liveCharacters.add(svg);
    ensurePointerListener();
    ensureIntersectionObs();
    ensureSpeechHook();
    if (intersectionObs) intersectionObs.observe(svg);
  }

  const idleSleepAfterMs = opts.idleSleepAfterMs ?? 30000;
  let sleepTimer = null;
  const armSleep = () => {
    if (sleepTimer) clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => svg.classList.add('state-sleep'), idleSleepAfterMs);
  };
  const wake = () => {
    svg.classList.remove('state-sleep');
    armSleep();
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerdown', wake, { passive: true });
  }
  armSleep();

  return {
    cheer: () => { wake(); setState(svg, 'state-cheer', 1800); },
    wiggle:() => { wake(); setState(svg, 'state-wiggle', 500); },
    think: () => { wake(); setState(svg, 'state-think'); },
    wave:  () => { wake(); setState(svg, 'state-wave', 1700); },
    sleep: () => { setState(svg, 'state-sleep'); },
    wake,
    setSpeaker: (on = true) => svg.classList.toggle('is-speaker', !!on),
    detach: () => {
      liveCharacters.delete(svg);
      attached.delete(svg);
      if (intersectionObs) intersectionObs.unobserve(svg);
      if (sleepTimer) clearTimeout(sleepTimer);
    },
  };
}

// Test seam — clear all animator state between tests.
export function _resetAnimator() {
  liveCharacters.clear();
  if (pointerListener && typeof document !== 'undefined') {
    document.removeEventListener('pointermove', pointerListener);
  }
  pointerListener = null;
  intersectionObs = null;
  speechHookInstalled = false;
}
