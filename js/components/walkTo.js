// walkTo — animate the world-map buddy walking from its current spot
// toward a hotspot before the route fires. Pure DOM + rAF; no library.
//
//   const handle = walkTo(buddyGroup, hotspotGroup, {
//     onArrive: () => ctx.navigate('library'),
//     duration: 600,
//   });
//   // Later, if the scene unmounts mid-walk:
//   handle.cancel();
//
// The buddy is an SVG <g> child of the map SVG. The target is any SVG
// element with a getBBox() — usually another <g class="hotspot">. We
// translate the buddy's transform across the SVG's user-units so the
// motion is independent of the rendered size.

function bboxCenter(el) {
  // jsdom doesn't implement getBBox; fall back to data-x/data-y the
  // worldMap scene stamps on each hotspot for testability.
  if (typeof el.getBBox === 'function') {
    try {
      const b = el.getBBox();
      if (b && (b.width || b.height)) {
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }
    } catch (_) { /* fall through */ }
  }
  const dx = parseFloat(el.dataset?.cx);
  const dy = parseFloat(el.dataset?.cy);
  if (Number.isFinite(dx) && Number.isFinite(dy)) return { x: dx, y: dy };
  return { x: 0, y: 0 };
}

function readTranslate(el) {
  const t = el.getAttribute('transform') || '';
  const m = /translate\(\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*\)/.exec(t);
  if (!m) return { x: 0, y: 0 };
  return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
}

function writeTranslate(el, x, y) {
  el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
}

export function walkTo(buddy, target, opts = {}) {
  const duration = Math.max(0, opts.duration ?? 600);
  const onArrive = typeof opts.onArrive === 'function' ? opts.onArrive : () => {};
  const onStep   = typeof opts.onStep   === 'function' ? opts.onStep   : null;

  const start    = readTranslate(buddy);
  const targetXY = bboxCenter(target);
  const buddyXY  = bboxCenter(buddy);
  // Where the buddy currently sits in user-space = its bbox center
  // PLUS its current translate. We want the new translate so the bbox
  // center lands on targetXY.
  const desiredX = targetXY.x - (buddyXY.x - start.x);
  const desiredY = targetXY.y - (buddyXY.y - start.y);

  let cancelled = false;
  let rafId     = null;
  let arrived   = false;
  const t0 = (typeof performance !== 'undefined' && performance.now)
    ? performance.now()
    : Date.now();

  const finish = () => {
    if (arrived) return;
    arrived = true;
    writeTranslate(buddy, desiredX, desiredY);
    try { onArrive(); } catch (_) { /* noop */ }
  };

  if (duration === 0) {
    finish();
    return { cancel: () => {}, get arrived() { return arrived; } };
  }

  const step = (now) => {
    if (cancelled) return;
    const elapsed = ((now ?? Date.now()) - t0);
    const t = Math.min(1, elapsed / duration);
    // Ease-in-out for a calmer walk. Children read jerky motion as bad.
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const x = start.x + (desiredX - start.x) * e;
    const y = start.y + (desiredY - start.y) * e;
    writeTranslate(buddy, x, y);
    if (onStep) {
      try { onStep(t); } catch (_) { /* noop */ }
    }
    if (t >= 1) { finish(); return; }
    rafId = (typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame(step)
      : setTimeout(() => step(Date.now()), 16));
  };

  rafId = (typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame(step)
    : setTimeout(() => step(Date.now()), 0));

  return {
    cancel() {
      cancelled = true;
      if (rafId != null) {
        if (typeof cancelAnimationFrame !== 'undefined') {
          try { cancelAnimationFrame(rafId); } catch (_) { /* noop */ }
        } else {
          try { clearTimeout(rafId); } catch (_) { /* noop */ }
        }
      }
    },
    get arrived() { return arrived; },
  };
}
