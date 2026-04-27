// Ambient drifting elements for the world-map hub.
//
// We render two kinds of decoration:
//
//   1. Drifters (.ambient-drift) — a butterfly + a leaf that glide
//      across the screen on a long loop. Polish v2 upgrade: each one
//      is a small inline SVG (was emoji glyph) so it renders as a
//      hand-drawn painted shape, with a slight wobble in flight.
//
//   2. Sparkles (.ambient-sparkle) — small twinkling stars pinned
//      near each hotspot, fading in and out at staggered phases.
//      Mimics the magical-egg sparkle of the reference site.
//
// Pure decorative; honors prefers-reduced-motion via CSS.
//
//   const detach = attachAmbient(scene);
//   // later
//   detach();

const NS = 'http://www.w3.org/2000/svg';

// SVG markup for each drifter. Returned as a function so each call
// gets a fresh independent <svg>. ViewBox 0..40 so the sprite is small.
function butterflySvg(doc) {
  const s = doc.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 40 40');
  s.setAttribute('class', 'ambient-svg');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `
    <g>
      <!-- left wing -->
      <ellipse cx="12" cy="14" rx="10" ry="8" fill="#ff7eb6" stroke="#5a3216" stroke-width="1" />
      <ellipse cx="12" cy="26" rx="8"  ry="6" fill="#c89bff" stroke="#5a3216" stroke-width="1" />
      <!-- right wing -->
      <ellipse cx="28" cy="14" rx="10" ry="8" fill="#ff7eb6" stroke="#5a3216" stroke-width="1" />
      <ellipse cx="28" cy="26" rx="8"  ry="6" fill="#c89bff" stroke="#5a3216" stroke-width="1" />
      <!-- wing dots -->
      <circle cx="12" cy="14" r="2" fill="#fff" />
      <circle cx="28" cy="14" r="2" fill="#fff" />
      <!-- body -->
      <rect x="19" y="10" width="2" height="22" rx="1" fill="#5a3216" />
      <!-- antennae -->
      <path d="M 20 10 q -3 -4 -6 -3" stroke="#5a3216" stroke-width="1" fill="none" />
      <path d="M 20 10 q  3 -4  6 -3" stroke="#5a3216" stroke-width="1" fill="none" />
    </g>
  `;
  return s;
}

function leafSvg(doc) {
  const s = doc.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 40 40');
  s.setAttribute('class', 'ambient-svg');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `
    <g>
      <path d="M 6 28 Q 12 6 34 12 Q 28 30 6 28 Z"
            fill="#7ed47b" stroke="#3f8a44" stroke-width="1.2" />
      <path d="M 12 24 Q 22 18 30 16" stroke="#3f8a44" stroke-width="1" fill="none" />
      <path d="M 16 26 q 4 -3 6 -2" stroke="#3f8a44" stroke-width="0.8" fill="none" />
      <path d="M 20 28 q 4 -3 6 -2" stroke="#3f8a44" stroke-width="0.8" fill="none" />
    </g>
  `;
  return s;
}

const DRIFTERS = [
  { build: butterflySvg, cls: 'ambient-drift',                     top: '14%', delay: '0s' },
  { build: leafSvg,      cls: 'ambient-drift ambient-drift--leaf', top: '62%', delay: '6s' },
];

// Six sparkles pinned at percentage-based positions near the hotspots.
// Each gets a different animation phase via inline CSS variable.
const SPARKLES = [
  { top: '18%', left: '22%', delay: '0s'   },
  { top: '20%', left: '76%', delay: '1.4s' },
  { top: '54%', left: '14%', delay: '2.6s' },
  { top: '52%', left: '82%', delay: '0.8s' },
  { top: '12%', left: '50%', delay: '3.4s' },
  { top: '78%', left: '40%', delay: '2.0s' },
];

function sparkleSvg(doc) {
  const s = doc.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 20 20');
  s.setAttribute('class', 'ambient-sparkle-svg');
  s.setAttribute('aria-hidden', 'true');
  // Four-point star, white core with yellow halo.
  s.innerHTML = `
    <g>
      <path d="M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z"
            fill="#ffd166" />
      <path d="M 10 4 L 11 9 L 16 10 L 11 11 L 10 16 L 9 11 L 4 10 L 9 9 Z"
            fill="#ffffff" />
    </g>
  `;
  return s;
}

export function attachAmbient(host, doc = (typeof document !== 'undefined' ? document : null)) {
  if (!host || !doc) return () => {};
  const created = [];

  // Drifters
  for (const d of DRIFTERS) {
    const span = doc.createElement('span');
    span.className = d.cls;
    span.setAttribute('aria-hidden', 'true');
    span.style.top = d.top;
    span.style.left = '-8vw';
    span.style.animationDelay = d.delay;
    span.appendChild(d.build(doc));
    host.appendChild(span);
    created.push(span);
  }

  // Sparkles
  for (const sp of SPARKLES) {
    const span = doc.createElement('span');
    span.className = 'ambient-sparkle';
    span.setAttribute('aria-hidden', 'true');
    span.style.top = sp.top;
    span.style.left = sp.left;
    span.style.animationDelay = sp.delay;
    span.appendChild(sparkleSvg(doc));
    host.appendChild(span);
    created.push(span);
  }

  return () => {
    for (const el of created) {
      try { el.remove(); } catch (_) { /* noop */ }
    }
  };
}
