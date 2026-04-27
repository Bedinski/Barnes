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
import { buildHotspotIcon } from '../components/hotspotIcons.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Hotspot layout in SVG user-units (viewBox 0 0 1000 640). Each entry
// owns its color and target route. Coordinates are tuned so the buddy
// has room to walk between them on phone-sized canvases.
const HOTSPOTS = [
  { id: 'library',       label: 'Books',     route: 'library',       cx: 200, cy: 180, color: 'var(--c-orange)' },
  { id: 'phonics',       label: 'Sounds',    route: 'phonics',       cx: 800, cy: 180, color: 'var(--c-blue)' },
  { id: 'cloze',         label: 'Fill In',   route: 'cloze',         cx: 200, cy: 480, color: 'var(--c-purple)' },
  { id: 'wordPicture',   label: 'Match',     route: 'wordPicture',   cx: 800, cy: 480, color: 'var(--c-green)' },
  { id: 'buildSentence', label: 'Build',     route: 'buildSentence', cx: 500, cy: 80,  color: 'var(--c-pink)' },
  { id: 'stickerBook',   label: 'Stickers',  route: null /* Phase C */, cx: 350, cy: 580, color: 'var(--c-yellow)' },
  { id: 'closet',        label: 'Closet',    route: 'closet',        cx: 650, cy: 580, color: 'var(--c-red)' },
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
  // The big colored disk under each place.
  // No SVG filter here — the crayon-edge displacement filter causes
  // hover hit-test oscillation when the cursor is near the wobbly
  // rendered edge. Hand-drawn feel comes from the inner ring + icon
  // detail instead.
  el('circle', {
    class: 'hotspot-bubble',
    cx: 0, cy: 0, r: 60,
    fill: spot.color,
    stroke: 'var(--c-ink)',
    'stroke-width': 4,
  }, g);
  // Inner cream ring so the icon sits on a lighter background and the
  // colored disk reads as a frame, not a flat fill.
  el('circle', {
    class: 'hotspot-inner',
    cx: 0, cy: 0, r: 48,
    fill: 'var(--c-paper, #fdfaf2)',
    opacity: 0.85,
    'pointer-events': 'none',
  }, g);
  // Custom SVG icon, scaled to fit the inner ring.
  // The icon's viewBox is 0..100, target a ~76px diameter circle so we
  // scale to 0.76 and translate to center.
  const iconSvg = buildHotspotIcon(spot.id);
  // Wrap the inner <svg> in a <g> with a transform so it composes with
  // the parent SVG's coordinate system.
  const iconWrap = el('g', {
    class: 'hotspot-icon-wrap',
    transform: 'translate(-38 -38) scale(0.76)',
    'pointer-events': 'none',
  }, g);
  iconWrap.appendChild(iconSvg);
  // Label under the bubble.
  const label = el('text', {
    class: 'hotspot-label',
    x: 0, y: 92,
  }, g);
  label.textContent = spot.label;
  return g;
}

// Build the parallax background: a stack of <g> layers from sky → far
// hills → near meadow. Each layer drifts in from offscreen on entry to
// give the world a feel of depth. CSS @keyframes do the actual drift
// (see .map-parallax--{near,far} in crayola.css). Honors
// prefers-reduced-motion via the existing media query.
function buildParallax(svg) {
  // Sky layer — gradient rect + a couple of puffy clouds.
  const sky = el('g', { class: 'map-parallax map-parallax--sky' }, svg);
  el('rect', { x: 0, y: 0, width: 1000, height: 480, fill: 'url(#sky-gradient)' }, sky);
  // Cloud 1 (left)
  const c1 = el('g', { class: 'map-cloud', transform: 'translate(180 110)' }, sky);
  el('ellipse', { cx: 0,  cy: 0, rx: 38, ry: 18, fill: '#ffffff', opacity: 0.9 }, c1);
  el('ellipse', { cx: 30, cy: -6, rx: 26, ry: 16, fill: '#ffffff', opacity: 0.9 }, c1);
  el('ellipse', { cx: -28, cy: -4, rx: 22, ry: 14, fill: '#ffffff', opacity: 0.85 }, c1);
  // Cloud 2 (right)
  const c2 = el('g', { class: 'map-cloud', transform: 'translate(770 80)' }, sky);
  el('ellipse', { cx: 0,  cy: 0, rx: 32, ry: 14, fill: '#ffffff', opacity: 0.85 }, c2);
  el('ellipse', { cx: 22, cy: 4, rx: 20, ry: 12, fill: '#ffffff', opacity: 0.8 }, c2);

  // Far hills layer — two rounded silhouettes drift at a slow rate.
  const farHills = el('g', { class: 'map-parallax map-parallax--far' }, svg);
  el('path', {
    d: 'M -20 360 Q 200 220 460 320 T 1020 320 V 640 H -20 Z',
    fill: '#cfe9d8',
  }, farHills);
  el('path', {
    d: 'M -20 420 Q 240 320 540 380 T 1020 360 V 640 H -20 Z',
    fill: '#a8d3b8',
  }, farHills);

  // Near meadow layer — front grass + grass blade detail.
  const meadow = el('g', { class: 'map-parallax map-parallax--near' }, svg);
  el('path', {
    d: 'M -20 480 Q 220 420 520 460 T 1020 440 V 640 H -20 Z',
    fill: '#7ed47b',
  }, meadow);
  // 12 grass blade tufts scattered along the front.
  const bladeXs = [40, 110, 175, 260, 340, 420, 510, 590, 670, 750, 830, 910];
  for (const x of bladeXs) {
    const y = 540 + ((x * 7) % 25);
    el('path', {
      d: `M ${x} ${y} l -3 -16 l 1 14 l 4 -16 l -1 16 l 4 -14 l -2 16 z`,
      fill: '#3f8a44',
    }, meadow);
  }
  // A couple of tiny flowers
  const flowers = [
    { x: 90,  y: 530, c: '#ff5d5d' },
    { x: 380, y: 520, c: '#ff7eb6' },
    { x: 720, y: 540, c: '#ffd166' },
    { x: 920, y: 528, c: '#7fc8ff' },
  ];
  for (const f of flowers) {
    el('circle', { cx: f.x, cy: f.y, r: 6, fill: f.c }, meadow);
    el('circle', { cx: f.x, cy: f.y, r: 2, fill: '#ffffff' }, meadow);
  }
}

// SVG <defs> local to the world map (gradient + bark stripe pattern
// referenced by hotspot icons). These are added once per mount.
function buildLocalDefs(svg) {
  const defs = el('defs', {}, svg);
  defs.innerHTML = `
    <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#bfe6ff" />
      <stop offset="60%"  stop-color="#dff2fb" />
      <stop offset="100%" stop-color="#f4f7e9" />
    </linearGradient>
    <pattern id="bark-stripes" patternUnits="userSpaceOnUse" width="3" height="6">
      <rect width="3" height="6" fill="#7a4a26" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="#5a3216" stroke-width="0.5" />
    </pattern>
    <pattern id="bench-grain" patternUnits="userSpaceOnUse" width="10" height="2">
      <rect width="10" height="2" fill="#a0673a" />
      <line x1="0" y1="1" x2="10" y2="1" stroke="#5a3216" stroke-width="0.3" />
    </pattern>
  `;
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

  // Local defs (gradients + patterns referenced by parallax + icons).
  buildLocalDefs(svg);

  // Parallax background layers (sky / far hills / near meadow). Drawn
  // before hotspots so the hotspots and buddy compose on top.
  buildParallax(svg);

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
  // Force explicit pixel dimensions on the inner <svg>. Without these,
  // the nested SVG inherits 100% of its containing block, which inside
  // an outer <svg>/<g> causes the buddy to scale up to the entire
  // viewport — giant koala covering half the world map.
  const BUDDY_W = 220, BUDDY_H = 260;
  let buddySvg = buildBuddy({ size: 'tall' });
  buddySvg.setAttribute('width',  String(BUDDY_W));
  buddySvg.setAttribute('height', String(BUDDY_H));
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
    buddySvg.setAttribute('width',  String(BUDDY_W));
    buddySvg.setAttribute('height', String(BUDDY_H));
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
