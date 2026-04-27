// Scene illustrations for the Sentence-to-Picture and Build-a-Sentence
// games. Each builder returns an <svg> illustrating one sentence by
// composing characters from koala.js / panda.js with simple drawn props
// (tree, log, ball, sun, grass).

import { buildKoala } from './koala.js?v=4';
import { buildPanda } from './panda.js?v=4';

const SVG_NS = 'http://www.w3.org/2000/svg';

function frame() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 300');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', 'scene-svg');
  // Sky + grass backdrop
  svg.innerHTML = `
    <rect x="0" y="0" width="400" height="300" fill="#cdeefd" />
    <ellipse cx="340" cy="60" rx="40" ry="40" fill="#ffd166" opacity="0.6" />
    <rect x="0" y="220" width="400" height="80" fill="#a8e6a3" />
  `;
  return svg;
}

function place(svg, characterSvg, { x, y, w, rotate = 0 }) {
  const wrapper = document.createElementNS(SVG_NS, 'g');
  const ratio = w / 200; // character viewBox is 200x220
  wrapper.setAttribute('transform', `translate(${x} ${y}) scale(${ratio}) rotate(${rotate} 100 110)`);
  wrapper.appendChild(characterSvg);
  svg.appendChild(wrapper);
}

function tree(svg, x = 80, y = 100) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'tree';
  g.innerHTML = `
    <rect x="${x - 8}" y="${y + 60}" width="16" height="120" fill="#8b5a2b" />
    <circle cx="${x}" cy="${y + 30}" r="60" fill="#6dbf6a" />
    <circle cx="${x - 30}" cy="${y + 50}" r="40" fill="#7ed47b" />
    <circle cx="${x + 30}" cy="${y + 50}" r="40" fill="#5bb558" />
  `;
  svg.appendChild(g);
  return g;
}

function log(svg, x = 200, y = 220) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'log';
  g.innerHTML = `
    <ellipse cx="${x}" cy="${y}" rx="80" ry="14" fill="#8b5a2b" />
    <ellipse cx="${x - 78}" cy="${y}" rx="6" ry="14" fill="#5e3a1a" />
    <ellipse cx="${x + 78}" cy="${y}" rx="6" ry="14" fill="#5e3a1a" />
    <line x1="${x - 60}" y1="${y - 8}" x2="${x + 60}" y2="${y - 8}" stroke="#5e3a1a" stroke-width="2" />
  `;
  svg.appendChild(g);
  return g;
}

function ball(svg, x, y, color = '#ff5d5d') {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'ball';
  g.innerHTML = `
    <circle cx="${x}" cy="${y}" r="22" fill="${color}" />
    <path d="M ${x - 22} ${y} Q ${x} ${y - 8} ${x + 22} ${y}" stroke="#ffffff" stroke-width="2" fill="none" />
    <path d="M ${x - 22} ${y} Q ${x} ${y + 8} ${x + 22} ${y}" stroke="#ffffff" stroke-width="2" fill="none" />
  `;
  svg.appendChild(g);
  return g;
}

function bigSun(svg) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.dataset.label = 'sun';
  g.innerHTML = `
    <circle cx="200" cy="120" r="70" fill="#ffd166" />
    <g stroke="#f5b842" stroke-width="6" stroke-linecap="round">
      <line x1="200" y1="20"  x2="200" y2="40"  />
      <line x1="200" y1="200" x2="200" y2="220" />
      <line x1="100" y1="120" x2="120" y2="120" />
      <line x1="280" y1="120" x2="300" y2="120" />
      <line x1="130" y1="50"  x2="145" y2="65"  />
      <line x1="270" y1="50"  x2="255" y2="65"  />
      <line x1="130" y1="190" x2="145" y2="175" />
      <line x1="270" y1="190" x2="255" y2="175" />
    </g>
    <circle cx="180" cy="115" r="6" fill="#222" />
    <circle cx="220" cy="115" r="6" fill="#222" />
    <path d="M 180 135 Q 200 150 220 135" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round" />
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
    ball(s, 200, 230, '#ffd166');
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
    ball(s, 90, 230, '#ffd166');
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
