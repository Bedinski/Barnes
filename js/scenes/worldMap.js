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

import { buildBuddy } from '../components/buddy.js?v=7';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter }   from '../components/stars.js';
import { buildStreakChip }    from '../components/streak.js';
import { buildSettingsButton } from '../components/settings.js';
import { walkTo } from '../components/walkTo.js';
import { attachAmbient } from '../components/ambient.js';
import { buildHotspotIcon } from '../components/hotspotIcons.js?v=7';
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

// Build the underwater backdrop: water column, caustic light shafts,
// distant coral silhouettes, and a sandy seafloor. Three depth layers
// keep the existing CSS animation hooks (.map-parallax--sky/--far
// /--near) so the entry drift still applies.
function buildParallax(svg) {
  // Water column layer (the "sky" anchor — keeps CSS class for the
  // existing entry animation).
  const sky = el('g', { class: 'map-parallax map-parallax--sky' }, svg);
  el('rect', { x: 0, y: 0, width: 1000, height: 640, fill: 'url(#water-gradient)' }, sky);
  // Three light shafts beaming down from the surface.
  el('path', { d: 'M 140 0 L 200 0 L 280 640 L 200 640 Z', fill: '#ffffff', opacity: 0.18 }, sky);
  el('path', { d: 'M 460 0 L 520 0 L 600 640 L 520 640 Z', fill: '#ffffff', opacity: 0.14 }, sky);
  el('path', { d: 'M 760 0 L 820 0 L 880 640 L 820 640 Z', fill: '#ffffff', opacity: 0.16 }, sky);
  // A handful of distant background bubbles.
  const distantBubbles = [
    { x: 80,  y: 90,  r: 5 }, { x: 130, y: 200, r: 3 },
    { x: 920, y: 140, r: 4 }, { x: 880, y: 240, r: 2.5 },
    { x: 60,  y: 380, r: 3 }, { x: 950, y: 380, r: 3 },
  ];
  for (const b of distantBubbles) {
    el('circle', { cx: b.x, cy: b.y, r: b.r, fill: '#c8efff', stroke: '#3a7ec0', 'stroke-width': 1, opacity: 0.6 }, sky);
  }

  // Far layer: distant coral / kelp silhouettes against the deeper water.
  const farHills = el('g', { class: 'map-parallax map-parallax--far' }, svg);
  el('path', {
    d: 'M -20 460 Q 100 360 220 420 T 460 410 T 700 420 T 1020 400 V 640 H -20 Z',
    fill: '#0c2748',
    opacity: 0.85,
  }, farHills);
  el('path', {
    d: 'M -20 510 Q 150 440 320 480 T 660 470 T 1020 460 V 640 H -20 Z',
    fill: '#143b6e',
    opacity: 0.9,
  }, farHills);
  // Distant coral towers
  for (const x of [120, 280, 580, 760, 920]) {
    el('path', {
      d: `M ${x-12} 510 Q ${x-16} 470 ${x-6} 440 Q ${x+4} 470 ${x+10} 480 Q ${x+18} 470 ${x+12} 510 Z`,
      fill: '#26d8b6',
      opacity: 0.55,
    }, farHills);
  }

  // Near layer: sandy seafloor + foreground coral.
  const meadow = el('g', { class: 'map-parallax map-parallax--near' }, svg);
  el('path', {
    d: 'M -20 540 Q 200 500 480 525 T 1020 510 V 640 H -20 Z',
    fill: 'url(#sand-gradient)',
  }, meadow);
  // Pebble dots
  const pebbles = [
    { x: 60, y: 600, r: 4, c: '#a8794a' }, { x: 170, y: 612, r: 5, c: '#946838' },
    { x: 290, y: 596, r: 3, c: '#a8794a' }, { x: 420, y: 614, r: 6, c: '#946838' },
    { x: 540, y: 600, r: 4, c: '#a8794a' }, { x: 680, y: 612, r: 5, c: '#946838' },
    { x: 800, y: 600, r: 3, c: '#a8794a' }, { x: 920, y: 612, r: 6, c: '#946838' },
  ];
  for (const p of pebbles) el('circle', { cx: p.x, cy: p.y, r: p.r, fill: p.c }, meadow);
  // Foreground coral tufts (sea-floor flora)
  const tufts = [
    { x: 80,  c: '#ff5ca6' },
    { x: 380, c: '#ff7a1a' },
    { x: 720, c: '#1ec4a3' },
    { x: 920, c: '#ffd23f' },
  ];
  for (const t of tufts) {
    el('path', {
      d: `M ${t.x-10} 560 Q ${t.x-14} 540 ${t.x-4} 524 Q ${t.x+2} 538 ${t.x+8} 530 Q ${t.x+14} 542 ${t.x+10} 560 Z`,
      fill: t.c,
      stroke: '#061226',
      'stroke-width': 1.5,
      'stroke-linejoin': 'round',
    }, meadow);
  }
}

// SVG <defs> local to the world map (gradients + patterns referenced
// by the parallax + hotspot icons). Added once per mount.
function buildLocalDefs(svg) {
  const defs = el('defs', {}, svg);
  defs.innerHTML = `
    <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#bfe5ff" />
      <stop offset="25%"  stop-color="#5cb1de" />
      <stop offset="55%"  stop-color="#1e5b97" />
      <stop offset="85%"  stop-color="#0c2748" />
      <stop offset="100%" stop-color="#07172e" />
    </linearGradient>
    <linearGradient id="sand-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f0d49a" />
      <stop offset="100%" stop-color="#c89a5e" />
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

  // Curving "current" connecting the hotspots — bright foam-cyan so
  // it reads against the dark ocean column.
  el('path', {
    d: 'M 200 180 C 400 100 600 100 800 180 S 950 360 800 480 S 400 600 200 480 S 50 280 200 180 Z',
    fill: 'none',
    stroke: '#c8efff',
    'stroke-width': 5,
    'stroke-linecap': 'round',
    'stroke-dasharray': '2 14',
    opacity: 0.65,
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
  // the koala filled the whole map. Belt-and-suspenders: also pin x/y.
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
