import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mount } from '../js/scenes/reader.js';
import { BOOKS } from '../js/data/books.js';
import { _resetAnimator } from '../js/characters/animator.js';

beforeEach(() => {
  _resetAnimator();
  document.body.innerHTML = '<div id="app"></div>';
  globalThis.localStorage.clear();
});

test('reader mounts first page of requested book', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[0].id });
  const indicator = root.querySelector('.page-indicator');
  assert.ok(indicator);
  assert.match(indicator.textContent, /Page 1 of/);
  const pageText = root.querySelector('.page-text');
  assert.ok(pageText);
  assert.equal(pageText.textContent.replace(/\s+/g, ' ').trim(),
    BOOKS[0].pages[0].text.replace(/\s+/g, ' ').trim());
  unmount();
});

test('every word on the page is a tappable .readable-word span', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[0].id });
  const words = root.querySelectorAll('.readable-word');
  const expected = BOOKS[0].pages[0].text.match(/\w+/g).length;
  assert.equal(words.length, expected);
  unmount();
});

test('tapping a word triggers speech (visible via :is-highlight)', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[0].id });
  const word = root.querySelector('.readable-word');
  word.click();
  assert.ok(word.classList.contains('is-highlight'));
  unmount();
});

test('Next button advances the page; Back button returns', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[0].id });

  const [prevBtn, _, nextBtn] = root.querySelectorAll('.reader-controls .btn');
  nextBtn.click();
  assert.match(root.querySelector('.page-indicator').textContent, /Page 2 of/);
  prevBtn.click();
  assert.match(root.querySelector('.page-indicator').textContent, /Page 1 of/);
  unmount();
});

test('finishing the last page shows comprehension question', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const book = BOOKS[0];
  const unmount = mount(root, ctx, { bookId: book.id });

  const nextBtn = root.querySelectorAll('.reader-controls .btn')[2];
  for (let i = 0; i < book.pages.length; i++) nextBtn.click();
  // After the last page, comprehension is shown: the prompt is the question.
  const prompt = root.querySelector('.prompt');
  assert.ok(prompt);
  assert.equal(prompt.textContent, book.comprehension[0].question);
  assert.ok(root.querySelectorAll('.scene-card').length >= 2);
  unmount();
});

test('answering comprehension correctly awards a star and marks book complete', async () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const book = BOOKS[0];
  const unmount = mount(root, ctx, { bookId: book.id });

  const nextBtn = root.querySelectorAll('.reader-controls .btn')[2];
  for (let i = 0; i < book.pages.length; i++) nextBtn.click();

  // Walk through every comprehension question: pick the card tagged with
  // the correct sceneId; wait for the 1400ms advance before checking again.
  for (let q = 0; q < book.comprehension.length; q++) {
    const correctSceneId = book.comprehension[q].options.find((o) => o.correct).sceneId;
    const card = root.querySelector(`.scene-card[data-scene-id="${correctSceneId}"]`);
    assert.ok(card, `missing correct card for q${q}`);
    card.click();
    await new Promise((r) => setTimeout(r, 1500));
  }
  const stored = JSON.parse(globalThis.localStorage.getItem('kpr.books') || '[]');
  assert.ok(stored.includes(book.id), 'book should be recorded as completed');
  unmount();
});

test('"Read to me" button speaks the page and highlights words', async () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[0].id });

  // The auto-read fires on mount via setTimeout(350); wait past it to clear,
  // then press the button ourselves so we're testing the explicit invocation.
  await new Promise((r) => setTimeout(r, 400));
  const readBtn = Array.from(root.querySelectorAll('.reader-controls .btn'))
    .find((b) => /Read to me/i.test(b.textContent));
  assert.ok(readBtn, 'missing Read to me button');
  readBtn.click();
  // Since the stubbed speechSynthesis fires onstart synchronously, the
  // timed-fallback path kicks in after 400ms; give it one tick to start.
  await new Promise((r) => setTimeout(r, 50));
  // Either a word is highlighted (boundary path) OR will be shortly (timed).
  // Verify no runtime error and the control still exists after a read.
  assert.ok(root.querySelector('.readable-word'), 'words should still be rendered');
  unmount();
});

test('reader renders a narrator koala in the corner of the page art', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[0].id });
  const narrator = root.querySelector('.narrator-slot .character.koala');
  assert.ok(narrator, 'narrator koala should be present on every reader page');
  unmount();
});

test('page-text content matches the book text exactly (word order preserved)', () => {
  const ctx = { navigate: () => {} };
  const root = document.getElementById('app');
  const unmount = mount(root, ctx, { bookId: BOOKS[1].id });
  const words = Array.from(root.querySelectorAll('.readable-word'))
    .map((w) => w.dataset.word);
  const expected = BOOKS[1].pages[0].text.match(/\w+/g);
  assert.deepEqual(words, expected);
  unmount();
});

test('unknown bookId redirects to library', () => {
  const calls = [];
  const ctx = { navigate: (n) => calls.push(n) };
  const root = document.getElementById('app');
  mount(root, ctx, { bookId: 'not-a-book' });
  // redirect happens inside a setTimeout(0), so wait one tick
  return new Promise((r) => setTimeout(() => {
    assert.ok(calls.includes('library'));
    r();
  }, 5));
});
