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

  // Soft drop shadow used by the world-map hotspots so they read as
  // little 3D buttons floating above the watercolor backdrop.
  const dropShadow = doc.createElementNS(SVG_NS, 'filter');
  dropShadow.setAttribute('id', 'soft-shadow');
  dropShadow.setAttribute('x', '-20%');
  dropShadow.setAttribute('y', '-20%');
  dropShadow.setAttribute('width', '140%');
  dropShadow.setAttribute('height', '140%');
  const sBlur = doc.createElementNS(SVG_NS, 'feGaussianBlur');
  sBlur.setAttribute('in', 'SourceAlpha');
  sBlur.setAttribute('stdDeviation', '3');
  sBlur.setAttribute('result', 'sblur');
  const sOffset = doc.createElementNS(SVG_NS, 'feOffset');
  sOffset.setAttribute('in', 'sblur');
  sOffset.setAttribute('dx', '0');
  sOffset.setAttribute('dy', '4');
  sOffset.setAttribute('result', 'soffset');
  const sFlood = doc.createElementNS(SVG_NS, 'feFlood');
  sFlood.setAttribute('flood-color', '#000');
  sFlood.setAttribute('flood-opacity', '0.18');
  const sComp = doc.createElementNS(SVG_NS, 'feComposite');
  sComp.setAttribute('in2', 'soffset');
  sComp.setAttribute('operator', 'in');
  sComp.setAttribute('result', 'shadow');
  const sMerge = doc.createElementNS(SVG_NS, 'feMerge');
  const sMergeNode1 = doc.createElementNS(SVG_NS, 'feMergeNode');
  sMergeNode1.setAttribute('in', 'shadow');
  const sMergeNode2 = doc.createElementNS(SVG_NS, 'feMergeNode');
  sMergeNode2.setAttribute('in', 'SourceGraphic');
  sMerge.appendChild(sMergeNode1);
  sMerge.appendChild(sMergeNode2);
  dropShadow.appendChild(sBlur);
  dropShadow.appendChild(sOffset);
  dropShadow.appendChild(sFlood);
  dropShadow.appendChild(sComp);
  dropShadow.appendChild(sMerge);
  defs.appendChild(dropShadow);

  // Reusable radial gradients give every flat fill a "lit-from-above"
  // sheen so the world-map bubbles read as 3D-ish balls instead of flat
  // discs. Each gradient is referenced by id from the hotspot drawer.
  const GRADIENTS = [
    { id: 'g-orange', a: '#ffba6c', b: '#ff8a3d', c: '#cc5d18' },
    { id: 'g-blue',   a: '#7fc6ff', b: '#3aa6ff', c: '#1576d4' },
    { id: 'g-purple', a: '#cca6ff', b: '#a672ff', c: '#7142cc' },
    { id: 'g-green',  a: '#9ee2a5', b: '#54c45e', c: '#2e8a37' },
    { id: 'g-pink',   a: '#ffb1cf', b: '#ff77b1', c: '#cc4a85' },
    { id: 'g-yellow', a: '#ffe480', b: '#ffd23f', c: '#cc9d00' },
    { id: 'g-red',    a: '#ff8b8b', b: '#ef3e3e', c: '#a02020' },
  ];
  for (const g of GRADIENTS) {
    const rg = doc.createElementNS(SVG_NS, 'radialGradient');
    rg.setAttribute('id', g.id);
    rg.setAttribute('cx', '35%');
    rg.setAttribute('cy', '30%');
    rg.setAttribute('r', '70%');
    rg.setAttribute('fx', '30%');
    rg.setAttribute('fy', '25%');
    const s1 = doc.createElementNS(SVG_NS, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', g.a);
    const s2 = doc.createElementNS(SVG_NS, 'stop');
    s2.setAttribute('offset', '60%');
    s2.setAttribute('stop-color', g.b);
    const s3 = doc.createElementNS(SVG_NS, 'stop');
    s3.setAttribute('offset', '100%');
    s3.setAttribute('stop-color', g.c);
    rg.appendChild(s1);
    rg.appendChild(s2);
    rg.appendChild(s3);
    defs.appendChild(rg);
  }

  // Linear sky gradient used as the world-map backdrop inside the SVG.
  const sky = doc.createElementNS(SVG_NS, 'linearGradient');
  sky.setAttribute('id', 'g-sky-meadow');
  sky.setAttribute('x1', '0'); sky.setAttribute('y1', '0');
  sky.setAttribute('x2', '0'); sky.setAttribute('y2', '1');
  for (const stop of [
    { o: '0%',  c: '#fff7e8' },
    { o: '45%', c: '#ffeec0' },
    { o: '70%', c: '#ffe1a8' },
    { o: '100%',c: '#ffd388' },
  ]) {
    const s = doc.createElementNS(SVG_NS, 'stop');
    s.setAttribute('offset', stop.o);
    s.setAttribute('stop-color', stop.c);
    sky.appendChild(s);
  }
  defs.appendChild(sky);

  svg.appendChild(defs);
  doc.body.appendChild(svg);
  return svg;
}

export function _unmountSvgFilters(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc) return;
  const el = doc.getElementById(ROOT_ID);
  if (el) el.remove();
}
