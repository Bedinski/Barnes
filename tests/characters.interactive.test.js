import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { buildScene } from '../js/characters/sceneArt.js';
import { makeSceneInteractive } from '../js/characters/interactive.js';
import { _resetAnimator } from '../js/characters/animator.js';
import { _resetBadges, getStats } from '../js/components/badges.js';

beforeEach(() => {
  _resetAnimator();
  _resetBadges();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('makeSceneInteractive marks characters and props with cursor:pointer', () => {
  const svg = buildScene('koala-in-tree');
  document.body.appendChild(svg);
  makeSceneInteractive(svg);
  // Tree prop is data-label tagged.
  const tree = svg.querySelector('[data-label="tree"]');
  assert.ok(tree, 'tree prop should be tagged');
  assert.equal(tree.style.cursor, 'pointer');
  // Character is tappable too.
  const ch = svg.querySelector('.character');
  assert.ok(ch);
  assert.equal(ch.style.cursor, 'pointer');
});

function dispatchClick(el) {
  // SVG elements in JSDOM don't always honor .click(); dispatchEvent works.
  el.dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true, cancelable: true }));
}

test('clicking a prop bumps wordsTapped (vocabulary reinforcement)', () => {
  const svg = buildScene('koala-on-log');
  document.body.appendChild(svg);
  makeSceneInteractive(svg);
  const log = svg.querySelector('[data-label="log"]');
  assert.ok(log);
  dispatchClick(log);
  assert.equal(getStats().wordsTapped, 1);
});

test('clicking a character bumps wordsTapped', () => {
  const svg = buildScene('little-panda');
  document.body.appendChild(svg);
  makeSceneInteractive(svg);
  const ch = svg.querySelector('.character');
  dispatchClick(ch);
  assert.equal(getStats().wordsTapped, 1);
});

test('cleanup function detaches animator handles without throwing', () => {
  const svg = buildScene('three-koalas');
  document.body.appendChild(svg);
  const cleanup = makeSceneInteractive(svg);
  assert.equal(typeof cleanup, 'function');
  assert.doesNotThrow(cleanup);
});
