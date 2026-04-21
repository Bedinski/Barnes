import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildPanda } from '../js/characters/panda.js';

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

test('buildPanda returns an SVGElement with the character class', () => {
  const svg = buildPanda();
  assert.equal(svg.tagName.toLowerCase(), 'svg');
  assert.ok(svg.classList.contains('character'));
  assert.ok(svg.classList.contains('panda'));
});

test('buildPanda includes the same anatomy contract as koala', () => {
  // Critical: animator.js targets these groups by class on either species.
  const svg = buildPanda();
  document.body.appendChild(svg);
  for (const id of REQUIRED_GROUPS) {
    assert.ok(svg.querySelector(`#${id}`), `missing #${id}`);
  }
  svg.remove();
});

test('panda variant "pinky" applies expected metadata', () => {
  const p = buildPanda({ variant: 'pinky' });
  assert.equal(p.dataset.variant, 'pinky');
  assert.ok(p.classList.contains('variant-pinky'));
});

test('accessory "bamboo" injects a bamboo prop', () => {
  const p = buildPanda({ accessory: 'bamboo' });
  assert.ok(p.querySelector('.bamboo-stalk'));
});

test('accessory "bow" injects a bow prop', () => {
  const p = buildPanda({ accessory: 'bow' });
  assert.ok(p.querySelector('.accessory.bow'));
});
