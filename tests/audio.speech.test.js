import { speechCalls, resetCalls } from './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { speak, isSpeechAvailable, _resetVoiceCache } from '../js/audio/speech.js';

beforeEach(() => { resetCalls(); _resetVoiceCache(); });

test('isSpeechAvailable() returns true when stub is installed', () => {
  assert.equal(isSpeechAvailable(), true);
});

test('speak() defaults to child-friendly rate and pitch', () => {
  speak('hello');
  assert.equal(speechCalls.length, 1);
  assert.equal(speechCalls[0].text, 'hello');
  assert.equal(speechCalls[0].rate, 0.85);
  assert.equal(speechCalls[0].pitch, 1.2);
});

test('speak() honors caller-provided rate/pitch overrides', () => {
  speak('faster', { rate: 1.0, pitch: 1.0 });
  assert.equal(speechCalls[0].rate, 1.0);
  assert.equal(speechCalls[0].pitch, 1.0);
});

test('speak() emits speech:start and speech:end events', () => {
  const events = [];
  const onStart = (e) => events.push(['start', e.detail.text]);
  const onEnd   = (e) => events.push(['end',   e.detail.text]);
  globalThis.addEventListener('speech:start', onStart);
  globalThis.addEventListener('speech:end',   onEnd);
  speak('events please');
  globalThis.removeEventListener('speech:start', onStart);
  globalThis.removeEventListener('speech:end',   onEnd);
  assert.deepEqual(events, [['start', 'events please'], ['end', 'events please']]);
});

test('speak() with no text returns false and does nothing', () => {
  assert.equal(speak(''), false);
  assert.equal(speechCalls.length, 0);
});

test('speak() degrades gracefully when speechSynthesis is missing', () => {
  const real = globalThis.speechSynthesis;
  // Temporarily blow it away
  globalThis.speechSynthesis = undefined;
  globalThis.window.speechSynthesis = undefined;
  globalThis.SpeechSynthesisUtterance = undefined;
  globalThis.window.SpeechSynthesisUtterance = undefined;

  const events = [];
  const onEnd = (e) => events.push(e.detail.text);
  globalThis.addEventListener('speech:end', onEnd);
  // Re-import module would be cleaner, but the API path is purely runtime-checked.
  const result = speak('quiet');
  globalThis.removeEventListener('speech:end', onEnd);

  assert.equal(result, false);
  assert.deepEqual(events, ['quiet']);

  // Restore for other tests in the same process.
  globalThis.speechSynthesis = real;
  globalThis.window.speechSynthesis = real;
  globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  globalThis.window.SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance;
});
