import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FAMILIES, PHONEME, phonemeFor, getFamily } from '../js/data/phonics.js';

test('at least 5 word families ship', () => {
  assert.ok(FAMILIES.length >= 5, `got ${FAMILIES.length}`);
});

test('every family has a unique id and rime, and 3+ words', () => {
  const ids = new Set();
  for (const f of FAMILIES) {
    assert.match(f.id, /^[a-z]+$/);
    assert.ok(!ids.has(f.id));
    ids.add(f.id);
    assert.match(f.rime, /^[a-z]+$/);
    assert.ok(f.words.length >= 3, `${f.id} needs ≥3 words`);
  }
});

test('every word ends with the family rime and has an emoji', () => {
  for (const f of FAMILIES) {
    for (const w of f.words) {
      assert.ok(w.word.endsWith(f.rime), `"${w.word}" does not end with "${f.rime}"`);
      assert.ok(w.emoji && w.emoji.length > 0, `"${w.word}" needs an emoji`);
    }
  }
});

test('every word is a valid CVC word (3 letters, consonant-vowel-consonant)', () => {
  const vowels = /[aeiou]/i;
  for (const f of FAMILIES) {
    for (const w of f.words) {
      assert.equal(w.word.length, 3, `"${w.word}" must be 3 letters`);
      assert.match(w.word, /^[a-z]{3}$/, `"${w.word}" lowercase letters only`);
      assert.match(w.word[1], vowels, `"${w.word}" middle char must be a vowel`);
    }
  }
});

test('PHONEME map covers every letter used in the families', () => {
  const used = new Set();
  for (const f of FAMILIES) for (const w of f.words) for (const c of w.word) used.add(c);
  for (const c of used) assert.ok(PHONEME[c], `missing PHONEME for "${c}"`);
});

test('phonemeFor returns the mapped sound (case-insensitive)', () => {
  assert.equal(phonemeFor('a'), 'ah');
  assert.equal(phonemeFor('C'), 'kuh');
  assert.equal(phonemeFor('?'), '?'); // unknown returns as-is
});

test('getFamily returns the family by id, null otherwise', () => {
  assert.equal(getFamily(FAMILIES[0].id), FAMILIES[0]);
  assert.equal(getFamily('xx'), null);
});
