// SVG filter definitions used by the Crayola visual layer (Phase A).
//
// We append a single hidden <svg> to <body> at app boot containing the
// reusable <filter> elements (paper-grain, crayon-edge). They're then
// referenced from CSS via filter: url(#paper-grain) etc. Idempotent —
// calling mountSvgFilters() more than once is a no-op.

const ROOT_ID = 'kpr-svg-filters';
const SVG_NS  = 'http://www.w3.org/2000/svg';

export function mountSvgFilters(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc) return null;
  const existing = doc.getElementById(ROOT_ID);
  if (existing) return existing;

  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('id', ROOT_ID);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('focusable', 'false');
  svg.style.position = 'absolute';
  svg.style.width    = '0';
  svg.style.height   = '0';
  svg.style.overflow = 'hidden';
  svg.style.pointerEvents = 'none';

  const defs = doc.createElementNS(SVG_NS, 'defs');

  // Paper-grain: low-amplitude turbulence displaces a flat surface so
  // the page reads as watercolor paper rather than a solid fill.
  const paper = doc.createElementNS(SVG_NS, 'filter');
  paper.setAttribute('id', 'paper-grain');
  paper.setAttribute('x', '0');
  paper.setAttribute('y', '0');
  paper.setAttribute('width', '100%');
  paper.setAttribute('height', '100%');
  const turb = doc.createElementNS(SVG_NS, 'feTurbulence');
  turb.setAttribute('type', 'fractalNoise');
  turb.setAttribute('baseFrequency', '0.85');
  turb.setAttribute('numOctaves', '2');
  turb.setAttribute('seed', '7');
  turb.setAttribute('result', 'noise');
  const disp = doc.createElementNS(SVG_NS, 'feDisplacementMap');
  disp.setAttribute('in', 'SourceGraphic');
  disp.setAttribute('in2', 'noise');
  disp.setAttribute('scale', '1.4');
  paper.appendChild(turb);
  paper.appendChild(disp);
  defs.appendChild(paper);

  // Crayon-edge: subtle horizontal jitter so a stroked edge looks
  // hand-drawn. Used by SVG hotspot bubbles.
  const crayon = doc.createElementNS(SVG_NS, 'filter');
  crayon.setAttribute('id', 'crayon-edge');
  crayon.setAttribute('x', '-5%');
  crayon.setAttribute('y', '-5%');
  crayon.setAttribute('width', '110%');
  crayon.setAttribute('height', '110%');
  const cTurb = doc.createElementNS(SVG_NS, 'feTurbulence');
  cTurb.setAttribute('type', 'fractalNoise');
  cTurb.setAttribute('baseFrequency', '0.04');
  cTurb.setAttribute('numOctaves', '2');
  cTurb.setAttribute('seed', '3');
  cTurb.setAttribute('result', 'cnoise');
  const cDisp = doc.createElementNS(SVG_NS, 'feDisplacementMap');
  cDisp.setAttribute('in', 'SourceGraphic');
  cDisp.setAttribute('in2', 'cnoise');
  cDisp.setAttribute('scale', '2.4');
  crayon.appendChild(cTurb);
  crayon.appendChild(cDisp);
  defs.appendChild(crayon);

  svg.appendChild(defs);
  doc.body.appendChild(svg);
  return svg;
}

export function _unmountSvgFilters(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc) return;
  const el = doc.getElementById(ROOT_ID);
  if (el) el.remove();
}
