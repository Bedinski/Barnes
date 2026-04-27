// World map hub (Phase A) — replaces the home card grid with an
// open-world SVG playground. Each scene becomes a "place" the buddy
// walks toward; tapping a place plays a tap chime, walks the buddy,
// then routes via the existing scene router.
//
// Phase A note: the Sticker Garden hotspot is a stub that just speaks
// "Coming soon!" — Phase C wires it to the real stickerBook scene.
//
// The buddy on the hub is rendered with the existing buildKoala. Phase
// B will swap this for buildBuddy() so the kid's chosen buddy appears.

import { buildBuddy } from '../components/buddy.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter }   from '../components/stars.js';
import { buildStreakChip }    from '../components/streak.js';
import { buildSettingsButton } from '../components/settings.js';
import { walkTo } from '../components/walkTo.js';
import { attachAmbient } from '../components/ambient.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Hotspot layout in SVG user-units (viewBox 0 0 1000 640). Each entry
// owns its color and target route. Coordinates are tuned so the buddy
// has room to walk between them on phone-sized canvases.
const HOTSPOTS = [
  { id: 'library',       label: 'Books',     route: 'library',       cx: 200, cy: 180, color: 'var(--c-orange)', emoji: '📚' },
  { id: 'phonics',       label: 'Sounds',    route: 'phonics',       cx: 800, cy: 180, color: 'var(--c-blue)',   emoji: '🔤' },
  { id: 'cloze',         label: 'Fill In',   route: 'cloze',         cx: 200, cy: 480, color: 'var(--c-purple)', emoji: '🧠' },
  { id: 'wordPicture',   label: 'Match',     route: 'wordPicture',   cx: 800, cy: 480, color: 'var(--c-green)',  emoji: '🧩' },
  { id: 'buildSentence', label: 'Build',     route: 'buildSentence', cx: 500, cy: 80,  color: 'var(--c-pink)',   emoji: '✍️' },
  { id: 'stickerBook',   label: 'Stickers',  route: null /* Phase C */, cx: 350, cy: 580, color: 'var(--c-yellow)', emoji: '🌟' },
  { id: 'closet',        label: 'Closet',    route: 'closet',        cx: 650, cy: 580, color: 'var(--c-red)',    emoji: '🎒' },
];

function el(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    node.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(node);
  return node;
}

function buildHotspot(spot) {
  const g = el('g', {
    class: 'hotspot',
    'data-place': spot.id,
    'data-cx': String(spot.cx),
    'data-cy': String(spot.cy),
    role: 'button',
    'aria-label': `${spot.label} — ${spot.id}`,
    tabindex: '0',
    transform: `translate(${spot.cx} ${spot.cy})`,
  });
  // Centered around (0,0) so transform-origin is predictable for the
  // hover scale defined in crayola.css.
  el('circle', {
    class: 'hotspot-bubble',
    cx: 0, cy: 0, r: 60,
    fill: spot.color,
    stroke: 'var(--c-ink)',
    'stroke-width': 4,
    filter: 'url(#crayon-edge)',
  }, g);
  // Big emoji in the bubble center.
  const emoji = el('text', {
    class: 'hotspot-emoji',
    x: 0, y: 8,
    'text-anchor': 'middle',
    'font-size': 44,
    'pointer-events': 'none',
  }, g);
  emoji.textContent = spot.emoji;
  // Label under the bubble.
  const label = el('text', {
    class: 'hotspot-label',
    x: 0, y: 92,
  }, g);
  label.textContent = spot.label;
  return g;
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene world-map crayola-bg';

  // ----- Topbar -----
  const top = document.createElement('div');
  top.className = 'topbar';
  const title = document.createElement('h1');
  title.className = 'title title--hand';
  title.textContent = 'Reading World';
  top.appendChild(title);
  top.appendChild(buildStreakChip());
  top.appendChild(buildStarCounter());
  top.appendChild(buildSettingsButton());

  const parentLink = document.createElement('button');
  parentLink.type = 'button';
  parentLink.className = 'btn btn--ghost parent-link';
  parentLink.title = 'For grown-ups';
  parentLink.setAttribute('aria-label', 'Open grown-ups dashboard');
  parentLink.textContent = '👪';
  parentLink.addEventListener('click', () => { tapSound(); ctx.navigate('parent'); });
  top.appendChild(parentLink);
  scene.appendChild(top);

  // ----- Map canvas (the SVG) -----
  const canvas = document.createElement('div');
  canvas.className = 'map-canvas';
  scene.appendChild(canvas);

  const svg = el('svg', {
    class: 'map-svg',
    viewBox: '0 0 1000 640',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'A map of all the reading places',
  });
  canvas.appendChild(svg);

  // Soft sky→meadow background inside the SVG so it composes with the
  // outer .crayola-bg gradient nicely.
  const sky = el('rect', { x: 0, y: 0, width: 1000, height: 640, fill: 'transparent' }, svg);
  void sky;

  // Curving path connecting the hotspots so the kid sees them as part
  // of one place, not isolated buttons. Cosmetic only.
  el('path', {
    d: 'M 200 180 C 400 100 600 100 800 180 S 950 360 800 480 S 400 600 200 480 S 50 280 200 180 Z',
    fill: 'none',
    stroke: 'var(--c-ink)',
    'stroke-width': 6,
    'stroke-linecap': 'round',
    'stroke-dasharray': '2 18',
    opacity: 0.35,
  }, svg);

  // ----- Hotspots -----
  const hotspotEls = new Map();
  for (const spot of HOTSPOTS) {
    const g = buildHotspot(spot);
    svg.appendChild(g);
    hotspotEls.set(spot.id, g);
  }

  // ----- Buddy in center -----
  const buddyG = el('g', {
    class: 'map-buddy',
    'data-cx': '500',
    'data-cy': '320',
    transform: 'translate(500 320)',
  });
  // The koala SVG is sized in pixels, so we wrap-and-scale via a foreignObject-free trick:
  // the koala builder returns a self-contained <svg>; we drop it inside a <g> and rely on
  // its intrinsic 220×260 box. Center it on (0,0) inside the group.
  // Buddy = the kid's chosen reading companion (Phase B). Defaults to
  // a classic koala with a leaf when nothing is saved yet.
  let buddySvg = buildBuddy({ size: 'tall' });
  // The builder sizes 'tall' at roughly 220×260; center it on the group origin.
  const BUDDY_W = 220, BUDDY_H = 260;
  let wrap = el('g', { transform: `translate(${-BUDDY_W / 2} ${-BUDDY_H / 2})` }, buddyG);
  wrap.appendChild(buddySvg);
  svg.appendChild(buddyG);

  let animHandle = animate(buddySvg);
  setTimeout(() => animHandle.wave(), 350);

  // Re-render the buddy when the kid edits in the closet so the hub
  // immediately reflects the change on return.
  const onBuddyChanged = () => {
    try { animHandle.detach(); } catch (_) {}
    wrap.remove();
    buddySvg = buildBuddy({ size: 'tall' });
    wrap = el('g', { transform: `translate(${-BUDDY_W / 2} ${-BUDDY_H / 2})` }, buddyG);
    wrap.appendChild(buddySvg);
    animHandle = animate(buddySvg);
  };
  document.addEventListener('buddy:changed', onBuddyChanged);

  // Ambient drifters (butterfly + leaf). Detach on unmount.
  const detachAmbient = attachAmbient(scene);

  // ----- Hotspot interaction -----
  let walkHandle = null;
  const goPlace = (spot, gEl) => {
    if (walkHandle) walkHandle.cancel();
    tapSound();
    if (!spot.route) {
      // Phase A stub for stickerBook — speak a friendly "Coming soon!"
      try { speak('Stickers are coming soon!'); } catch (_) { /* noop */ }
      return;
    }
    walkHandle = walkTo(buddyG, gEl, {
      duration: 600,
      onArrive: () => { ctx.navigate(spot.route); },
    });
  };

  const handlerCleanups = [];
  for (const [id, gEl] of hotspotEls) {
    const spot = HOTSPOTS.find((s) => s.id === id);
    const onClick = () => goPlace(spot, gEl);
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goPlace(spot, gEl);
      }
    };
    gEl.addEventListener('click', onClick);
    gEl.addEventListener('keydown', onKey);
    handlerCleanups.push(() => {
      gEl.removeEventListener('click', onClick);
      gEl.removeEventListener('keydown', onKey);
    });
  }

  container.appendChild(scene);

  // Friendly voice prompt — give the page a moment to mount and the
  // synth a moment to wake.
  const speakTimer = setTimeout(() => {
    try { speak('Pick a place to read or play.'); } catch (_) { /* noop */ }
  }, 450);

  return () => {
    clearTimeout(speakTimer);
    if (walkHandle) walkHandle.cancel();
    handlerCleanups.forEach((fn) => fn());
    document.removeEventListener('buddy:changed', onBuddyChanged);
    try { animHandle.detach(); } catch (_) { /* noop */ }
    try { detachAmbient(); } catch (_) { /* noop */ }
  };
}
