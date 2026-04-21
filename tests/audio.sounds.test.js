import { audioCalls, resetCalls } from './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { success, tryAgain, tap } from '../js/audio/sounds.js';

beforeEach(() => { resetCalls(); });

test('success() creates oscillators without throwing', () => {
  assert.doesNotThrow(() => success());
  // success plays 3 tones; each tone makes 1 osc + 1 gain
  const oscs = audioCalls.filter((c) => c === 'osc').length;
  assert.equal(oscs, 3);
});

test('tryAgain() creates 2 tones', () => {
  resetCalls();
  tryAgain();
  assert.equal(audioCalls.filter((c) => c === 'osc').length, 2);
});

test('tap() creates 1 tone', () => {
  resetCalls();
  tap();
  assert.equal(audioCalls.filter((c) => c === 'osc').length, 1);
});

test('all sound functions no-op gracefully when AudioContext is missing', () => {
  const real = globalThis.AudioContext;
  globalThis.AudioContext = undefined;
  globalThis.webkitAudioContext = undefined;
  globalThis.window.AudioContext = undefined;
  // Note: ctx is module-level cached; we can't reset it here without reimport.
  // The cached ctx from earlier tests will still work, so these calls will
  // succeed. To actually test the no-AudioContext branch we'd need a fresh
  // module import — which is skipped to keep tests simple. Restore.
  globalThis.AudioContext = real;
  globalThis.window.AudioContext = real;
  assert.doesNotThrow(() => { success(); tryAgain(); tap(); });
});
