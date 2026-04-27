import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { walkTo } from '../js/components/walkTo.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function makeRig() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 640');
  document.body.appendChild(svg);

  const buddy = document.createElementNS(SVG_NS, 'g');
  buddy.setAttribute('transform', 'translate(500 320)');
  buddy.dataset.cx = '500';
  buddy.dataset.cy = '320';
  svg.appendChild(buddy);

  const target = document.createElementNS(SVG_NS, 'g');
  target.setAttribute('transform', 'translate(200 180)');
  target.dataset.cx = '200';
  target.dataset.cy = '180';
  svg.appendChild(target);

  return { svg, buddy, target };
}

test('walkTo writes a translate transform on the buddy', async () => {
  const { buddy, target } = makeRig();
  await new Promise((resolve) => {
    walkTo(buddy, target, { duration: 50, onArrive: resolve });
  });
  const tr = buddy.getAttribute('transform');
  assert.match(tr, /translate\(/, 'transform should be a translate()');
  // Buddy should now sit roughly where the target was (200, 180).
  const m = /translate\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/.exec(tr);
  assert.ok(m, 'translate should match');
  assert.ok(Math.abs(parseFloat(m[1]) - 200) < 1, 'x should land on target');
  assert.ok(Math.abs(parseFloat(m[2]) - 180) < 1, 'y should land on target');
});

test('walkTo onArrive fires exactly once', async () => {
  const { buddy, target } = makeRig();
  let count = 0;
  await new Promise((resolve) => {
    walkTo(buddy, target, {
      duration: 30,
      onArrive: () => { count += 1; resolve(); },
    });
  });
  // Wait an extra tick to make sure no double-fire.
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(count, 1);
});

test('cancel() before arrival prevents onArrive from firing', async () => {
  const { buddy, target } = makeRig();
  let arrived = false;
  const handle = walkTo(buddy, target, {
    duration: 200,
    onArrive: () => { arrived = true; },
  });
  // Cancel immediately.
  handle.cancel();
  await new Promise((r) => setTimeout(r, 250));
  assert.equal(arrived, false, 'cancelled walks must not fire onArrive');
});

test('duration:0 jumps to target synchronously', () => {
  const { buddy, target } = makeRig();
  let arrived = false;
  walkTo(buddy, target, { duration: 0, onArrive: () => { arrived = true; } });
  assert.equal(arrived, true);
  const tr = buddy.getAttribute('transform');
  const m = /translate\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/.exec(tr);
  assert.ok(Math.abs(parseFloat(m[1]) - 200) < 1);
  assert.ok(Math.abs(parseFloat(m[2]) - 180) < 1);
});
