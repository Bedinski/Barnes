import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { buildKoala } from '../js/characters/koala.js';
import { buildPanda } from '../js/characters/panda.js';
import { attach, _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
});

test('attach() returns an API with all reaction methods', () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  const h = attach(svg);
  for (const m of ['cheer', 'wiggle', 'think', 'wave', 'sleep', 'wake', 'setSpeaker', 'detach']) {
    assert.equal(typeof h[m], 'function');
  }
});

test('cheer() adds state-cheer class then removes it after duration', async () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  const h = attach(svg);
  h.cheer();
  assert.ok(svg.classList.contains('state-cheer'));
  await new Promise((r) => setTimeout(r, 1900));
  assert.ok(!svg.classList.contains('state-cheer'));
});

test('wiggle() adds state-wiggle class then clears it', async () => {
  const svg = buildPanda();
  document.body.appendChild(svg);
  const h = attach(svg);
  h.wiggle();
  assert.ok(svg.classList.contains('state-wiggle'));
  await new Promise((r) => setTimeout(r, 600));
  assert.ok(!svg.classList.contains('state-wiggle'));
});

test('think() adds state-think (no auto-clear)', () => {
  const svg = buildPanda();
  document.body.appendChild(svg);
  const h = attach(svg);
  h.think();
  assert.ok(svg.classList.contains('state-think'));
});

test('setSpeaker(true) toggles the is-speaker class', () => {
  const svg = buildPanda();
  document.body.appendChild(svg);
  const h = attach(svg);
  h.setSpeaker(true);
  assert.ok(svg.classList.contains('is-speaker'));
  h.setSpeaker(false);
  assert.ok(!svg.classList.contains('is-speaker'));
});

test('speech:start adds is-talking; speech:end removes it', () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  attach(svg);

  globalThis.dispatchEvent(new CustomEvent('speech:start', { detail: { text: 'hi' } }));
  assert.ok(svg.classList.contains('is-talking'));

  globalThis.dispatchEvent(new CustomEvent('speech:end', { detail: { text: 'hi' } }));
  assert.ok(!svg.classList.contains('is-talking'));
});

test('cheer() also wakes a sleeping character', () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  const h = attach(svg);
  h.sleep();
  assert.ok(svg.classList.contains('state-sleep'));
  h.cheer();
  assert.ok(!svg.classList.contains('state-sleep'));
});

test('detach() removes the character from the live set', () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  const h = attach(svg);
  h.detach();
  // After detach, sleep timer is cleared; calling wake/cheer is still safe.
  assert.doesNotThrow(() => h.cheer());
});
