import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BOOKS, getBook, allBookPhrases } from '../js/data/books.js';
import { tokenize } from '../js/data/sentences.js';
import { ALL_SIGHT_WORDS, ALLOWED_NOUNS } from '../js/data/words.js';
import { hasScene } from '../js/characters/sceneArt.js';

const VOCAB = new Set([...ALL_SIGHT_WORDS, ...ALLOWED_NOUNS]);

test('at least 3 books ship with the app', () => {
  assert.ok(BOOKS.length >= 3, `got ${BOOKS.length}`);
});

test('every book has an id, title, level, pages, comprehension', () => {
  const ids = new Set();
  for (const b of BOOKS) {
    assert.match(b.id, /^[a-z0-9-]+$/, `bad id "${b.id}"`);
    assert.ok(!ids.has(b.id), `duplicate id ${b.id}`);
    ids.add(b.id);
    assert.ok(b.title.length > 0);
    assert.ok([1, 2, 3].includes(b.level), `bad level ${b.level}`);
    assert.ok(Array.isArray(b.pages) && b.pages.length >= 3, 'at least 3 pages');
    assert.ok(Array.isArray(b.comprehension) && b.comprehension.length >= 1, 'needs comprehension');
  }
});

test('levels span at least 1, 2, and 3', () => {
  const levels = new Set(BOOKS.map((b) => b.level));
  assert.ok(levels.has(1));
  assert.ok(levels.has(2));
  assert.ok(levels.has(3));
});

test('every page has text ending in a sentence-ending punct and a real sceneId', () => {
  for (const book of BOOKS) {
    for (const page of book.pages) {
      assert.match(page.text, /[.!?]$/, `"${page.text}" missing end punct`);
      assert.ok(hasScene(page.sceneId), `unknown sceneId "${page.sceneId}"`);
    }
  }
});

test('every word in every page text is in our sight-word or noun vocab', () => {
  for (const book of BOOKS) {
    for (const page of book.pages) {
      for (const w of tokenize(page.text)) {
        const cleaned = w.toLowerCase().replace(/[.,!?]/g, '');
        assert.ok(VOCAB.has(cleaned),
          `"${cleaned}" in "${page.text}" (${book.id}) not in vocab`);
      }
      // Choose-your-own-adventure pages: each option's text must also be
      // fully decodable, and option sceneIds must resolve.
      if (page.choice) {
        assert.ok(page.choice.question.length > 0);
        assert.ok(page.choice.options.length >= 2, 'CYOA needs ≥2 options');
        for (const opt of page.choice.options) {
          assert.ok(opt.label.length > 0);
          assert.ok(opt.text.length > 0);
          assert.ok(hasScene(opt.sceneId), `CYOA option scene "${opt.sceneId}" missing`);
          for (const w of tokenize(opt.text)) {
            const c = w.toLowerCase().replace(/[.,!?]/g, '');
            assert.ok(VOCAB.has(c), `"${c}" in CYOA option "${opt.text}" not in vocab`);
          }
        }
      }
    }
  }
});

test('comprehension: every option sceneId resolves and exactly one is correct', () => {
  for (const book of BOOKS) {
    for (const q of book.comprehension) {
      assert.ok(q.question.length > 0);
      assert.ok(q.options.length >= 2);
      for (const opt of q.options) assert.ok(hasScene(opt.sceneId));
      const correctCount = q.options.filter((o) => o.correct).length;
      assert.equal(correctCount, 1, `"${q.question}" needs exactly one correct answer`);
    }
  }
});

test('getBook() returns the right book by id, and null for unknown', () => {
  const b = getBook(BOOKS[0].id);
  assert.equal(b, BOOKS[0]);
  assert.equal(getBook('nope'), null);
});

test('allBookPhrases() returns one entry per page across all books', () => {
  const totalPages = BOOKS.reduce((n, b) => n + b.pages.length, 0);
  assert.equal(allBookPhrases().length, totalPages);
});
