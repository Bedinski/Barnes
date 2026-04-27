import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SENTENCES, tokenize } from '../js/data/sentences.js';
import { ALL_SIGHT_WORDS, ALLOWED_NOUNS } from '../js/data/words.js';
import { hasScene, listScenes } from '../js/characters/sceneArt.js';

const VOCAB = new Set([...ALL_SIGHT_WORDS, ...ALLOWED_NOUNS]);

test('there are at least 12 sentences', () => {
  assert.ok(SENTENCES.length >= 12, `got ${SENTENCES.length}`);
});

test('every sentence ends with a period', () => {
  for (const s of SENTENCES) assert.match(s.text, /\.$/);
});

test('every sentence references a real sceneId', () => {
  for (const s of SENTENCES) {
    assert.ok(hasScene(s.sceneId), `missing scene "${s.sceneId}" for "${s.text}"`);
  }
});

test('every sentence is built from known sight words + allowed nouns', () => {
  for (const s of SENTENCES) {
    for (const w of tokenize(s.text)) {
      const cleaned = w.toLowerCase().replace(/[.,!?]/g, '');
      assert.ok(
        VOCAB.has(cleaned),
        `"${cleaned}" in "${s.text}" is not in sight word list or allowed nouns`,
      );
    }
  }
});

test('tokenize() drops period and splits on whitespace', () => {
  assert.deepEqual(tokenize('The sun is up.'), ['The', 'sun', 'is', 'up']);
  assert.deepEqual(tokenize('Hi  there.'), ['Hi', 'there']);
});

test('there are enough scenes that wordPicture has distractors', () => {
  assert.ok(listScenes().length >= 6);
});

test('no two sentences share the same word multiset (buildSentence determinism)', () => {
  // buildSentence scene identifies the target by matching the tile multiset;
  // if two sentences had identical multisets, the test — and the game logic —
  // could incorrectly accept a wrong arrangement. Guard against that here.
  const seen = new Map();
  for (const s of SENTENCES) {
    const key = tokenize(s.text).map((w) => w.toLowerCase()).sort().join(' ');
    if (seen.has(key)) {
      assert.fail(`duplicate word multiset between "${seen.get(key)}" and "${s.text}"`);
    }
    seen.set(key, s.text);
  }
});

test('every sceneId in SENTENCES is also in sceneArt listScenes()', () => {
  const all = new Set(listScenes());
  for (const s of SENTENCES) {
    assert.ok(all.has(s.sceneId), `missing scene ${s.sceneId}`);
  }
});

// ----- Polish v2 invariants (preventing the "multiple correct orderings" bug) -----

test('no sentence has a content token appearing twice (a/the may appear at most once each)', () => {
  // The duplicate-the-twice problem made some Build-a-Sentence rounds
  // ambiguous because two slot orderings produced the same string. We
  // rule that out at the data layer: each token may appear at most
  // once, including the articles.
  for (const s of SENTENCES) {
    const tokens = tokenize(s.text).map((w) => w.toLowerCase());
    const counts = new Map();
    for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
    for (const [t, c] of counts) {
      assert.ok(c === 1, `token "${t}" appears ${c} times in "${s.text}" — duplicates make tile ordering ambiguous`);
    }
  }
});

test('corpus is graded into L1 (3-4), L2 (5-6), L3 (7-8) bands by token count', () => {
  // We don't require any sentence to declare its level — the level is
  // derived from token count. We just enforce that every sentence
  // falls into one of the three accepted bands.
  for (const s of SENTENCES) {
    const n = tokenize(s.text).length;
    assert.ok(n >= 3 && n <= 8, `"${s.text}" has ${n} tokens (must be 3-8)`);
  }
});

test('corpus has at least 5 sentences in each difficulty band', () => {
  // Variety guarantee: the practice rotations need enough range to
  // avoid feeling repetitive at any difficulty.
  const counts = { L1: 0, L2: 0, L3: 0 };
  for (const s of SENTENCES) {
    const n = tokenize(s.text).length;
    if (n <= 4) counts.L1++;
    else if (n <= 6) counts.L2++;
    else counts.L3++;
  }
  assert.ok(counts.L1 >= 5, `only ${counts.L1} L1 sentences`);
  assert.ok(counts.L2 >= 5, `only ${counts.L2} L2 sentences`);
  assert.ok(counts.L3 >= 5, `only ${counts.L3} L3 sentences`);
});

test('first letter of every sentence is uppercase, rest of words start lowercase or are I', () => {
  // Reading-fidelity check: capitalization should be exactly the kind
  // of thing a kindergartener is being taught — capital at the start,
  // lowercase elsewhere except for the pronoun "I".
  for (const s of SENTENCES) {
    const tokens = tokenize(s.text);
    assert.match(tokens[0], /^[A-Z]/, `"${s.text}" doesn't start with a capital letter`);
    for (let i = 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === 'I') continue;
      assert.match(t, /^[a-z]/, `mid-sentence word "${t}" in "${s.text}" should start lowercase`);
    }
  }
});

test('tokenize() handles trailing ! and ? as well as .', () => {
  assert.deepEqual(tokenize('Look at the panda!'), ['Look', 'at', 'the', 'panda']);
  assert.deepEqual(tokenize('Where is the panda?'), ['Where', 'is', 'the', 'panda']);
});
