import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildKoala } from '../js/characters/koala.js';

const REQUIRED_GROUPS = [
  'body', 'belly', 'head',
  'left-ear', 'right-ear',
  'left-eye', 'right-eye',
  'left-eyelid', 'right-eyelid',
  'left-cheek', 'right-cheek',
  'nose', 'mouth',
  'left-arm', 'right-arm',
  'left-leg', 'right-leg',
];

test('buildKoala returns an SVGElement with the character class', () => {
  const svg = buildKoala();
  assert.equal(svg.tagName.toLowerCase(), 'svg');
  assert.ok(svg.classList.contains('character'));
  assert.ok(svg.classList.contains('koala'));
});

test('buildKoala includes every named anatomy group', () => {
  const svg = buildKoala();
  document.body.appendChild(svg); // querySelector by id needs a parent in JSDOM
  for (const id of REQUIRED_GROUPS) {
    assert.ok(svg.querySelector(`#${id}`), `missing #${id}`);
  }
  svg.remove();
});

test('variant changes data-variant attribute and class', () => {
  const warm = buildKoala({ variant: 'warm' });
  assert.equal(warm.dataset.variant, 'warm');
  assert.ok(warm.classList.contains('variant-warm'));
});

test('size variant adds size-* class', () => {
  const tall = buildKoala({ size: 'tall' });
  assert.ok(tall.classList.contains('size-tall'));
  const chibi = buildKoala({ size: 'chibi' });
  assert.ok(chibi.classList.contains('size-chibi'));
});

test('accessory "leaf" injects a .accessory.leaf node', () => {
  const k = buildKoala({ accessory: 'leaf' });
  assert.ok(k.querySelector('.accessory.leaf'));
});

test('accessory "hat" injects a .accessory.hat node', () => {
  const k = buildKoala({ accessory: 'hat' });
  assert.ok(k.querySelector('.accessory.hat'));
});

test('koala has pupils inside eye groups (look-at-cursor target)', () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  assert.ok(svg.querySelector('#left-eye .pupil'));
  assert.ok(svg.querySelector('#right-eye .pupil'));
  svg.remove();
});

test('mouth has both closed and open paths for talk-sync', () => {
  const svg = buildKoala();
  document.body.appendChild(svg);
  assert.ok(svg.querySelector('.mouth-closed'));
  assert.ok(svg.querySelector('.mouth-open'));
  svg.remove();
});
