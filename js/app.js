// Tiny scene router. Each scene module exports `mount(container, ctx, data?)`
// which returns an unmount/cleanup function. `navigate(name, data)` swaps
// scenes and threads optional data (e.g. bookId for the reader).

import * as home          from './scenes/home.js';
import * as library       from './scenes/library.js';
import * as reader        from './scenes/reader.js';
import * as wordPicture   from './scenes/wordPicture.js';
import * as buildSentence from './scenes/buildSentence.js';
import { cancelSpeech }   from './audio/speech.js';

const SCENES = {
  home, library, reader, wordPicture, buildSentence,
};

export function createApp(container) {
  let currentUnmount = null;
  const ctx = {
    navigate(name, data) {
      const scene = SCENES[name] || SCENES.home;
      if (currentUnmount) {
        try { currentUnmount(); } catch (_) { /* noop */ }
        currentUnmount = null;
      }
      cancelSpeech();
      currentUnmount = scene.mount(container, ctx, data) || null;
    },
  };
  ctx.navigate('home');
  return ctx;
}

if (typeof document !== 'undefined' && document.getElementById('app')) {
  createApp(document.getElementById('app'));
}
