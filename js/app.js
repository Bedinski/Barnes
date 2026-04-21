// Tiny scene router. Each scene module exports `mount(container, ctx)`
// which returns an unmount/cleanup function. `navigate(name)` swaps scenes.

import * as home          from './scenes/home.js';
import * as tapWord       from './scenes/tapWord.js';
import * as wordPicture   from './scenes/wordPicture.js';
import * as buildSentence from './scenes/buildSentence.js';
import { cancelSpeech }   from './audio/speech.js';

const SCENES = {
  home, tapWord, wordPicture, buildSentence,
};

export function createApp(container) {
  let currentUnmount = null;
  const ctx = {
    navigate(name) {
      const scene = SCENES[name] || SCENES.home;
      if (currentUnmount) {
        try { currentUnmount(); } catch (_) { /* noop */ }
        currentUnmount = null;
      }
      cancelSpeech();
      currentUnmount = scene.mount(container, ctx) || null;
    },
  };
  ctx.navigate('home');
  return ctx;
}

if (typeof document !== 'undefined' && document.getElementById('app')) {
  createApp(document.getElementById('app'));
}
