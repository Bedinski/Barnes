import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PRE_K, KINDERGARTEN, FIRST_GRADE, ALL_WORDS, ALL_SIGHT_WORDS, ALLOWED_NOUNS,
} from '../js/data/words.js';

test('all word lists are non-empty', () => {
  assert.ok(PRE_K.length        > 30);
  assert.ok(KINDERGARTEN.length > 40);
  assert.ok(FIRST_GRADE.length  > 30);
});

test('every word is lowercase, trimmed, and alphabetic', () => {
  for (const list of [PRE_K, KINDERGARTEN, FIRST_GRADE]) {
    for (const w of list) {
      assert.equal(w, w.trim(), `"${w}" has whitespace`);
      assert.equal(w, w.toLowerCase(), `"${w}" not lowercase`);
      assert.match(w, /^[a-z]+$/, `"${w}" has non-alpha`);
    }
  }
});

test('no duplicates within a list', () => {
  for (const list of [PRE_K, KINDERGARTEN, FIRST_GRADE]) {
    assert.equal(new Set(list).size, list.length);
  }
});

test('K and 1st do not overlap', () => {
  const overlap = KINDERGARTEN.filter((w) => FIRST_GRADE.includes(w));
  assert.deepEqual(overlap, []);
});

test('ALL_WORDS = K + 1st (in that order, drilled set)', () => {
  assert.deepEqual(ALL_WORDS, [...KINDERGARTEN, ...FIRST_GRADE]);
});

test('ALL_SIGHT_WORDS includes pre-K too', () => {
  for (const w of PRE_K)        assert.ok(ALL_SIGHT_WORDS.includes(w));
  for (const w of KINDERGARTEN) assert.ok(ALL_SIGHT_WORDS.includes(w));
  for (const w of FIRST_GRADE)  assert.ok(ALL_SIGHT_WORDS.includes(w));
});

test('ALLOWED_NOUNS list is sane', () => {
  assert.ok(ALLOWED_NOUNS.includes('panda'));
  assert.ok(ALLOWED_NOUNS.includes('koala'));
  for (const n of ALLOWED_NOUNS) assert.match(n, /^[a-z]+$/);
});
