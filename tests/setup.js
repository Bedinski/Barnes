// Shared JSDOM setup for unit tests. Each test file imports this BEFORE
// importing any module under test, so window/document/localStorage and
// audio/speech stubs are wired up.

import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const { window } = dom;

// Expose JSDOM globals to Node so the modules under test (which are written
// for the browser) can use them unchanged.
globalThis.window           = window;
globalThis.document         = window.document;
globalThis.HTMLElement      = window.HTMLElement;
globalThis.SVGElement       = window.SVGElement;
globalThis.Node             = window.Node;
globalThis.Element          = window.Element;
globalThis.CustomEvent      = window.CustomEvent;
globalThis.Event            = window.Event;
globalThis.IntersectionObserver = class {
  observe() {} unobserve() {} disconnect() {}
};
globalThis.localStorage     = window.localStorage;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame  = (id) => clearTimeout(id);

// JSDOM doesn't implement the Web Animations API; stub it.
if (!window.Element.prototype.animate) {
  window.Element.prototype.animate = function () {
    return { finished: Promise.resolve(), cancel() {}, finish() {} };
  };
}

if (!window.dispatchEvent) {
  // JSDOM should already provide it, but be defensive.
  window.dispatchEvent = () => true;
}
globalThis.dispatchEvent  = window.dispatchEvent.bind(window);
globalThis.addEventListener = window.addEventListener.bind(window);
globalThis.removeEventListener = window.removeEventListener.bind(window);

// Spy-able stubs for browser audio APIs.
export const speechCalls = [];
class FakeUtterance {
  constructor(text) { this.text = text; this.onstart = null; this.onend = null; this.onerror = null; }
}
class FakeSynth {
  constructor() { this.queue = []; }
  speak(u) {
    this.queue.push(u);
    speechCalls.push({ text: u.text, rate: u.rate, pitch: u.pitch });
    // Fire start/end synchronously so tests don't need timers.
    if (u.onstart) u.onstart({});
    if (u.onend)   u.onend({});
  }
  cancel() { this.queue = []; }
  getVoices() { return [{ name: 'Samantha', lang: 'en-US' }]; }
}
window.speechSynthesis = new FakeSynth();
window.SpeechSynthesisUtterance = FakeUtterance;
globalThis.speechSynthesis = window.speechSynthesis;
globalThis.SpeechSynthesisUtterance = FakeUtterance;

export const audioCalls = [];
class FakeOsc {
  constructor() { this.frequency = { setValueAtTime: () => {} }; }
  connect(n) { return n; }
  start() {}
  stop() {}
}
class FakeGain {
  constructor() {
    this.gain = {
      setValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    };
  }
  connect(n) { return n; }
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.destination = {}; audioCalls.push('ctor'); }
  createOscillator() { audioCalls.push('osc'); return new FakeOsc(); }
  createGain()       { audioCalls.push('gain'); return new FakeGain(); }
}
window.AudioContext = FakeAudioContext;
globalThis.AudioContext = FakeAudioContext;

export function resetCalls() {
  speechCalls.length = 0;
  audioCalls.length  = 0;
}

export { window, dom };
