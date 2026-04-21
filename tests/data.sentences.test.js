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
