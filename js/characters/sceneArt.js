// Scene illustrations for the Sentence-to-Picture and Build-a-Sentence
// games. Sea-Hero reskin: sceneIds keep their legacy names
// ("koala-in-tree" etc.) for test/data compat, but the visuals now
// show Shark Hero / Octopus Hero in underwater settings (kelp pillars
// instead of trees, sunken treasure chests instead of logs, glowing
// pearl orbs instead of balls, sun shafts instead of grass meadows).

import { buildKoala } from './koala.js?v=5';
import { buildPanda } from './panda.js?v=5';

const SVG_NS = 'http://www.w3.org/2000/svg';

function frame() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 300');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', 'scene-svg');
  // Underwater backdrop: surface light at top → deep sea at bottom,
  // with a sandy floor, light shafts, and a few drifting bubbles.
  svg.innerHTML = `
    <defs>
      <linearGradient id="sa-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#bfe5ff" />
        <stop offset="35%"  stop-color="#5cb1de" />
        <stop offset="75%"  stop-color="#1e5b97" />
        <stop offset="100%" stop-color="#0c2748" />
      </linearGradient>
      <linearGradient id="sa-sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#f0d49a" />
        <stop offset="100%" stop-color="#c89a5e" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="400" height="300" fill="url(#sa-water)" />
    <path d="M 60 0 L 80 0 L 120 220 L 100 220 Z"   fill="#ffffff" opacity="0.18" />
    <path d="M 200 0 L 220 0 L 260 200 L 240 200 Z" fill="#ffffff" opacity="0.14" />
    <path d="M 320 0 L 340 0 L 360 180 L 340 180 Z" fill="#ffffff" opacity="0.12" />
    <ellipse cx="200" cy="290" rx="280" ry="30" fill="url(#sa-sand)" />
    <rect x="0" y="270" width="400" height="30" fill="url(#sa-sand)" />
    <circle cx="50"  cy="60"  r="4"   fill="#c8efff" stroke="#1e5b97" stroke-width="1" opacity="0.7" />
    <circle cx="80"  cy="100" r="2.5" fill="#c8efff" stroke="#1e5b97" stroke-width="1" opacity="0.65" />
    <circle cx="350" cy="80"  r="3"   fill="#c8efff" stroke="#1e5b97" stroke-width="1" opacity="0.7" />
    <circle cx="370" cy="120" r="2"   fill="#c8efff" stroke="#1e5b97" stroke-width="1" opacity="0.6" />
  `;
  return svg;
}

function place(svg, characterSvg, { x, y, w, rotate = 0 }) {
  const wrapper = document.createElementNS(SVG_NS, 'g');
  const ratio = w / 200;
  wrapper.setAttribute('transform', `translate(${x} ${y}) scale(${ratio}) rotate(${rotate} 100 110)`);
  // Pin the inner SVG's size so it doesn't expand to the parent
  // viewport (the same nested-svg gotcha that bit the world-map buddy).
  characterSvg.setAttribute('width', '200');
  characterSvg.setAttribute('height', '220');
  wrapper.appendChild(characterSvg);
  svg.appendChild(wrapper);
}

// "tree" → kelp pillar (seaweed reaching from sand to surface).
function tree(svg, x = 200, y = 100) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'tree';
  g.innerHTML = `
    <path d="M ${x-6} 280 Q ${x-14} ${y+80} ${x-2} ${y+20} Q ${x+10} ${y+50} ${x+4} 280 Z"
          fill="#1ec4a3" stroke="#061226" stroke-width="2" stroke-linejoin="round" />
    <ellipse cx="${x-20}" cy="${y+80}" rx="14" ry="6" fill="#168e76" stroke="#061226" stroke-width="1.5" transform="rotate(-30 ${x-20} ${y+80})" />
    <ellipse cx="${x+20}" cy="${y+50}" rx="16" ry="7" fill="#168e76" stroke="#061226" stroke-width="1.5" transform="rotate(20 ${x+20} ${y+50})" />
    <ellipse cx="${x-22}" cy="${y+20}" rx="12" ry="5" fill="#26d8b6" stroke="#061226" stroke-width="1.5" transform="rotate(-20 ${x-22} ${y+20})" />
    <ellipse cx="${x+22}" cy="${y-10}" rx="14" ry="6" fill="#26d8b6" stroke="#061226" stroke-width="1.5" transform="rotate(15 ${x+22} ${y-10})" />
    <ellipse cx="${x}" cy="${y-30}" rx="22" ry="10" fill="#26d8b6" stroke="#061226" stroke-width="2" />
  `;
  svg.appendChild(g);
  return g;
}

// "log" → sunken treasure chest.
function log(svg, x = 200, y = 240) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'log';
  g.innerHTML = `
    <ellipse cx="${x}" cy="${y+12}" rx="90" ry="10" fill="#000" opacity="0.25" />
    <path d="M ${x-78} ${y-14} Q ${x-78} ${y-40} ${x} ${y-42} Q ${x+78} ${y-40} ${x+78} ${y-14} Z"
          fill="#995a2e" stroke="#061226" stroke-width="2.5" stroke-linejoin="round" />
    <rect x="${x-78}" y="${y-14}" width="156" height="34" rx="4" fill="#7a4a2a" stroke="#061226" stroke-width="2.5" />
    <rect x="${x-78}" y="${y-14}" width="156" height="34" rx="4" fill="url(#g-shade)" opacity="0.4" />
    <rect x="${x-78}" y="${y-2}" width="156" height="4" fill="#404040" />
    <rect x="${x-3}"  y="${y-14}" width="6" height="34" fill="#404040" />
    <circle cx="${x}" cy="${y+3}" r="3" fill="#ffd23f" stroke="#061226" stroke-width="1.5" />
  `;
  svg.appendChild(g);
  return g;
}

// "ball" → glowing pearl orb.
function ball(svg, x, y, color = '#ffd23f') {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'ball';
  g.innerHTML = `
    <circle cx="${x}" cy="${y+4}" r="22" fill="#000" opacity="0.25" />
    <circle cx="${x}" cy="${y}"   r="22" fill="${color}" stroke="#061226" stroke-width="2" />
    <circle cx="${x-7}" cy="${y-7}" r="6" fill="#ffffff" opacity="0.7" />
    <g stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.6">
      <line x1="${x}" y1="${y-30}" x2="${x}" y2="${y-26}" />
      <line x1="${x}" y1="${y+30}" x2="${x}" y2="${y+26}" />
      <line x1="${x-30}" y1="${y}" x2="${x-26}" y2="${y}" />
      <line x1="${x+30}" y1="${y}" x2="${x+26}" y2="${y}" />
    </g>
  `;
  svg.appendChild(g);
  return g;
}

// "sun-up" → light shaft from the surface with a smiling face.
function bigSun(svg) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'sun';
  g.innerHTML = `
    <ellipse cx="200" cy="40" rx="120" ry="22" fill="#ffd23f" opacity="0.4" />
    <ellipse cx="200" cy="40" rx="80"  ry="14" fill="#fff8e0" opacity="0.85" />
    <path d="M 130 40 L 270 40 L 320 280 L 80 280 Z" fill="#ffd23f" opacity="0.18" />
    <path d="M 160 40 L 240 40 L 270 280 L 130 280 Z" fill="#ffffff" opacity="0.22" />
    <circle cx="200" cy="120" r="38" fill="#ffd23f" stroke="#a07b00" stroke-width="2" />
    <circle cx="186" cy="116" r="3.5" fill="#061226" />
    <circle cx="214" cy="116" r="3.5" fill="#061226" />
    <path d="M 184 132 Q 200 144 216 132" stroke="#061226" stroke-width="2.5" fill="none" stroke-linecap="round" />
  `;
  svg.appendChild(g);
}

const BUILDERS = {
  'sun-up': () => {
    const s = frame();
    bigSun(s);
    return s;
  },
  'panda-eats-bamboo': () => {
    const s = frame();
    place(s, buildPanda({ accessory: 'bamboo', size: 'medium' }), { x: 110, y: 60, w: 180 });
    return s;
  },
  'koala-in-tree': () => {
    const s = frame();
    tree(s, 200, 60);
    place(s, buildKoala({ size: 'chibi' }), { x: 150, y: 100, w: 100 });
    return s;
  },
  'koala-on-log': () => {
    const s = frame();
    log(s, 200, 240);
    place(s, buildKoala({ size: 'medium' }), { x: 130, y: 60, w: 140 });
    return s;
  },
  'little-panda': () => {
    const s = frame();
    place(s, buildPanda({ size: 'chibi' }), { x: 150, y: 110, w: 100 });
    return s;
  },
  'little-koala': () => {
    const s = frame();
    place(s, buildKoala({ size: 'chibi' }), { x: 150, y: 110, w: 100 });
    return s;
  },
  'play-ball': () => {
    const s = frame();
    ball(s, 200, 230, '#ffd23f');
    place(s, buildKoala({ size: 'chibi' }), { x: 60, y: 90, w: 110 });
    place(s, buildPanda({ size: 'chibi' }), { x: 230, y: 90, w: 110 });
    return s;
  },
  'koala-with-hat': () => {
    const s = frame();
    place(s, buildKoala({ accessory: 'hat', size: 'medium' }), { x: 110, y: 50, w: 180 });
    return s;
  },
  'brown-koala': () => {
    const s = frame();
    place(s, buildKoala({ variant: 'warm', size: 'medium' }), { x: 110, y: 50, w: 180 });
    return s;
  },
  'koala-jumping': () => {
    const s = frame();
    log(s, 200, 250);
    place(s, buildKoala({ size: 'medium' }), { x: 110, y: 30, w: 180, rotate: -8 });
    return s;
  },
  'pandas-in-grass': () => {
    const s = frame();
    place(s, buildPanda({ size: 'chibi' }), { x: 60,  y: 110, w: 110 });
    place(s, buildPanda({ size: 'chibi', variant: 'pinky' }), { x: 230, y: 110, w: 110 });
    return s;
  },
  'koala-under-tree': () => {
    const s = frame();
    tree(s, 200, 30);
    place(s, buildKoala({ size: 'medium' }), { x: 110, y: 110, w: 180 });
    return s;
  },
  'funny-panda': () => {
    const s = frame();
    const p = buildPanda({ accessory: 'bow', size: 'medium' });
    p.classList.add('state-cheer');
    place(s, p, { x: 110, y: 50, w: 180 });
    return s;
  },
  'three-koalas': () => {
    const s = frame();
    place(s, buildKoala({ size: 'chibi' }), { x: 30,  y: 120, w: 100 });
    place(s, buildKoala({ size: 'chibi', variant: 'warm' }), { x: 150, y: 120, w: 100 });
    place(s, buildKoala({ size: 'chibi', variant: 'blue' }), { x: 270, y: 120, w: 100 });
    return s;
  },
  'panda-with-ball': () => {
    const s = frame();
    ball(s, 90, 230, '#ffd23f');
    place(s, buildPanda({ size: 'medium' }), { x: 140, y: 50, w: 180 });
    return s;
  },
  'koala-running': () => {
    const s = frame();
    place(s, buildKoala({ size: 'medium' }), { x: 110, y: 60, w: 180, rotate: -12 });
    return s;
  },
};

export function buildScene(sceneId) {
  const builder = BUILDERS[sceneId];
  if (!builder) {
    const s = frame();
    return s;
  }
  return builder();
}

export function hasScene(sceneId) {
  return Object.prototype.hasOwnProperty.call(BUILDERS, sceneId);
}

export function listScenes() {
  return Object.keys(BUILDERS);
}
