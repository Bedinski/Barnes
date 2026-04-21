import { speechCalls, resetCalls } from './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { speak, isSpeechAvailable, getPreferredVoice, _resetVoiceCache } from '../js/audio/speech.js';

beforeEach(() => { resetCalls(); _resetVoiceCache(); });

test('isSpeechAvailable() returns true when stub is installed', () => {
  assert.equal(isSpeechAvailable(), true);
});

test('speak() defaults to child-friendly rate and pitch', () => {
  speak('hello');
  assert.equal(speechCalls.length, 1);
  assert.equal(speechCalls[0].text, 'hello');
  assert.equal(speechCalls[0].rate, 0.9);
  assert.equal(speechCalls[0].pitch, 1.1);
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

test('speak() with no text returns a no-op cancel and does nothing', () => {
  const cancel = speak('');
  assert.equal(typeof cancel, 'function');
  assert.equal(speechCalls.length, 0);
  // Cancel must be safe to call on a no-op.
  assert.doesNotThrow(() => cancel());
});

test('speak() returns a cancel function', () => {
  const cancel = speak('cancellable');
  assert.equal(typeof cancel, 'function');
  assert.doesNotThrow(() => cancel());
});

test('speak() with onBoundary fires the callback once per word (timed fallback)', () => {
  // Stub FakeSynth fires onstart synchronously but NOT onboundary — so
  // we should see synthesised boundaries covering every word, and they
  // should match the tokenised word count.
  // The timed fallback uses setTimeout(400), so in JSDOM we won't wait
  // for them; instead we verify the no-speech path fires all boundaries
  // synchronously.
  // Force the no-speech path:
  const realSynth = globalThis.speechSynthesis;
  const realCtor  = globalThis.SpeechSynthesisUtterance;
  globalThis.speechSynthesis = undefined;
  globalThis.window.speechSynthesis = undefined;
  globalThis.SpeechSynthesisUtterance = undefined;
  globalThis.window.SpeechSynthesisUtterance = undefined;

  const hits = [];
  speak('The cat sat.', { onBoundary: (i) => hits.push(i) });

  globalThis.speechSynthesis = realSynth;
  globalThis.window.speechSynthesis = realSynth;
  globalThis.SpeechSynthesisUtterance = realCtor;
  globalThis.window.SpeechSynthesisUtterance = realCtor;

  // "The cat sat" → 3 words → boundaries 0, 1, 2
  assert.deepEqual(hits, [0, 1, 2]);
});

test('speak() degrades gracefully when speechSynthesis is missing', () => {
  const realSynth = globalThis.speechSynthesis;
  const realCtor  = globalThis.SpeechSynthesisUtterance;
  globalThis.speechSynthesis = undefined;
  globalThis.window.speechSynthesis = undefined;
  globalThis.SpeechSynthesisUtterance = undefined;
  globalThis.window.SpeechSynthesisUtterance = undefined;

  const events = [];
  const onEnd = (e) => events.push(e.detail.text);
  globalThis.addEventListener('speech:end', onEnd);
  const cancel = speak('quiet');
  globalThis.removeEventListener('speech:end', onEnd);

  assert.equal(typeof cancel, 'function');
  assert.deepEqual(events, ['quiet']);

  globalThis.speechSynthesis = realSynth;
  globalThis.window.speechSynthesis = realSynth;
  globalThis.SpeechSynthesisUtterance = realCtor;
  globalThis.window.SpeechSynthesisUtterance = realCtor;
});

test('getPreferredVoice() picks a Samantha-class voice from the stub list', () => {
  // Our JSDOM stub advertises one voice: { name: 'Samantha', lang: 'en-US' }.
  // getPreferredVoice() must prefer that over a fallback.
  const v = getPreferredVoice();
  assert.ok(v, 'expected a voice to be picked');
  assert.equal(v.name, 'Samantha');
});

test('getPreferredVoice() avoids espeak/robotic voices even if they come first', () => {
  // Temporarily swap the stub's voice list so espeak appears before Samantha.
  const realGet = globalThis.speechSynthesis.getVoices;
  globalThis.speechSynthesis.getVoices = () => [
    { name: 'espeak',   lang: 'en-US' },
    { name: 'Samantha', lang: 'en-US' },
  ];
  _resetVoiceCache();
  const v = getPreferredVoice();
  globalThis.speechSynthesis.getVoices = realGet;
  _resetVoiceCache();
  assert.equal(v.name, 'Samantha', 'must not choose the espeak voice');
});

test('getPreferredVoice() prefers Google US English when available (Chrome default)', () => {
  const realGet = globalThis.speechSynthesis.getVoices;
  globalThis.speechSynthesis.getVoices = () => [
    { name: 'Microsoft David',   lang: 'en-US' },
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Samantha',          lang: 'en-US' },
  ];
  _resetVoiceCache();
  const v = getPreferredVoice();
  globalThis.speechSynthesis.getVoices = realGet;
  _resetVoiceCache();
  // Priority list puts 'google us english' first.
  assert.equal(v.name, 'Google US English');
});

test('speak() assigns the preferred voice to the utterance', () => {
  // The stub's FakeSynth captures speak({ text, rate, pitch }) but not
  // voice — so test via a shim that records the voice.
  const saved = [];
  const realSpeak = globalThis.speechSynthesis.speak;
  globalThis.speechSynthesis.speak = function (u) {
    saved.push(u.voice ? u.voice.name : null);
    if (u.onstart) u.onstart({});
    if (u.onend)   u.onend({});
  };
  _resetVoiceCache();
  speak('anything');
  globalThis.speechSynthesis.speak = realSpeak;
  assert.equal(saved[0], 'Samantha',
    'speak() must assign the picked voice, not leave utter.voice undefined');
});
