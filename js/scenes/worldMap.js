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

import { buildBuddy } from '../components/buddy.js?v=4';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter }   from '../components/stars.js';
import { buildStreakChip }    from '../components/streak.js';
import { buildSettingsButton } from '../components/settings.js';
import { walkTo } from '../components/walkTo.js';
import { attachAmbient } from '../components/ambient.js';
import { buildHotspotIcon } from '../components/hotspotIcons.js?v=4';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Hotspot layout in SVG user-units (viewBox 0 0 1000 640). Each entry
// owns its target route, gradient id (from svgFilters.js), illustrated
// glyph, and plain-text label rendered on a wooden plate below the
// bubble. Coordinates are tuned so the buddy has room to walk between
// them on phone-sized canvases.
const HOTSPOTS = [
  { id: 'library',       label: 'Books',    route: 'library',        cx: 200, cy: 180, grad: 'g-orange', glyph: '📖' },
  { id: 'phonics',       label: 'Sounds',   route: 'phonics',        cx: 800, cy: 180, grad: 'g-blue',   glyph: '🔤' },
  { id: 'cloze',         label: 'Fill In',  route: 'cloze',          cx: 200, cy: 460, grad: 'g-purple', glyph: '💭' },
  { id: 'wordPicture',   label: 'Match',    route: 'wordPicture',    cx: 800, cy: 460, grad: 'g-green',  glyph: '🧩' },
  { id: 'buildSentence', label: 'Build',    route: 'buildSentence',  cx: 500, cy: 100, grad: 'g-pink',   glyph: '✍️' },
  { id: 'stickerBook',   label: 'Stickers', route: null /* Phase C */, cx: 320, cy: 580, grad: 'g-yellow', glyph: '🌼' },
  { id: 'closet',        label: 'Closet',   route: 'closet',         cx: 680, cy: 580, grad: 'g-red',    glyph: '🎒' },
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
  // Wrap art + plate in a single group with the soft-shadow filter so
  // the entire icon casts one cohesive shadow.
  const art = el('g', { class: 'hotspot-art', filter: 'url(#soft-shadow)' }, g);
  // Soft outer glow (a slightly larger, faded copy behind the bubble)
  // — gives the bubble a halo of color so it reads as glowing not flat.
  el('circle', {
    class: 'hotspot-glow',
    cx: 0, cy: 0, r: 76,
    fill: `url(#${spot.grad})`,
    opacity: 0.28,
  }, art);
  // The main bubble — radial gradient + dark outline. The radial
  // gradient makes it read as a 3D ball lit from the upper-left.
  el('circle', {
    class: 'hotspot-bubble',
    cx: 0, cy: 0, r: 64,
    fill: `url(#${spot.grad})`,
    stroke: 'var(--c-ink)',
    'stroke-width': 3.5,
  }, art);
  // Inner highlight ellipse — sells the "lit ball" illusion.
  el('ellipse', {
    class: 'hotspot-shine',
    cx: -16, cy: -22, rx: 22, ry: 12,
    fill: '#ffffff',
    opacity: 0.45,
    'pointer-events': 'none',
  }, art);
  // Illustrated icon on top of the bubble. Each icon is hand-drawn as
  // a small SVG group (see js/components/hotspotIcons.js) so the place
  // reads as a real little scene — treehouse, cave, pond, etc. — not a
  // generic emoji circle.
  const icon = buildHotspotIcon(spot.id);
  if (icon) {
    icon.setAttribute('class', `${icon.getAttribute('class') || ''} hotspot-icon`);
    icon.setAttribute('pointer-events', 'none');
    art.appendChild(icon);
  } else {
    // Fallback if a hotspot id has no illustrated icon registered.
    const glyph = el('text', {
      class: 'hotspot-emoji',
      x: 0, y: 12,
      'text-anchor': 'middle',
      'font-size': 48,
      'pointer-events': 'none',
    }, art);
    glyph.textContent = spot.glyph;
  }

  // Wooden label plate under the bubble. Sits OUTSIDE the soft-shadow
  // group so its own contrast stays sharp.
  const plate = el('g', { class: 'hotspot-plate', transform: 'translate(0 88)' }, g);
  el('rect', {
    x: -52, y: -16, width: 104, height: 32, rx: 14, ry: 14,
    fill: '#fff8e7',
    stroke: 'var(--c-ink)',
    'stroke-width': 2.5,
    filter: 'url(#soft-shadow)',
  }, plate);
  const label = el('text', {
    class: 'hotspot-label',
    x: 0, y: 6,
  }, plate);
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
  // Buddy = the kid's chosen reading companion (Phase B). Defaults to
  // a classic koala with a leaf when nothing is saved yet.
  // BUG FIX: nested <svg> inside a parent <svg> defaults to 100% of the
  // outer viewport unless we set explicit width/height. Without that,
  // the koala filled the whole map.
  const BUDDY_W = 220, BUDDY_H = 260;
  let buddySvg = buildBuddy({ size: 'tall' });
  buddySvg.setAttribute('width',  String(BUDDY_W));
  buddySvg.setAttribute('height', String(BUDDY_H));
  buddySvg.setAttribute('x', '0');
  buddySvg.setAttribute('y', '0');
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
