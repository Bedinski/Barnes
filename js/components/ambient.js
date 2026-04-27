// Ambient drifting elements (Phase A) — a butterfly + a leaf that
// glide across the world-map hub. Pure decorative; honors
// prefers-reduced-motion via the .ambient-drift CSS class.
//
//   const detach = attachAmbient(scene);
//   // later
//   detach();

const DRIFTERS = [
  { glyph: '🦋', cls: 'ambient-drift',                 top: '14%', delay: '0s'  },
  { glyph: '🍃', cls: 'ambient-drift ambient-drift--leaf', top: '62%', delay: '6s' },
];

export function attachAmbient(host, doc = (typeof document !== 'undefined' ? document : null)) {
  if (!host || !doc) return () => {};
  const created = [];
  for (const d of DRIFTERS) {
    const span = doc.createElement('span');
    span.className = d.cls;
    span.setAttribute('aria-hidden', 'true');
    span.textContent = d.glyph;
    span.style.top = d.top;
    span.style.left = '-8vw';
    span.style.animationDelay = d.delay;
    host.appendChild(span);
    created.push(span);
  }
  return () => {
    for (const el of created) {
      try { el.remove(); } catch (_) { /* noop */ }
    }
  };
}
