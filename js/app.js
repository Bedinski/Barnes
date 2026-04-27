// Tiny scene router. Each scene module exports `mount(container, ctx, data?)`
// which returns an unmount/cleanup function. `navigate(name, data)` swaps
// scenes and threads optional data (e.g. bookId for the reader).

import * as home          from './scenes/home.js';
import * as worldMap      from './scenes/worldMap.js';
import * as library       from './scenes/library.js';
import * as reader        from './scenes/reader.js';
import * as wordPicture   from './scenes/wordPicture.js';
import * as buildSentence from './scenes/buildSentence.js';
import * as cloze         from './scenes/cloze.js';
import * as parent        from './scenes/parent.js';
import * as phonics       from './scenes/phonics.js';
import * as onboarding    from './scenes/onboarding.js';
import * as closet        from './scenes/closet.js';
import { cancelSpeech }   from './audio/speech.js';
import { tickStreak }     from './components/streak.js';
import { mountSvgFilters } from './components/svgFilters.js';
import { hasBuddy }        from './components/buddy.js';

// Phase A: the world-map hub is the new home. We alias 'home' →
// worldMap so all the existing "Back to Home" buttons in other scenes
// land on the new hub. The original home.js stays around for tests
// (tests/scenes.home.test.js imports from it directly) and as a
// fallback if we ever need to revert.
const SCENES = {
  home: worldMap,
  worldMap,
  library, reader, wordPicture, buildSentence, cloze, parent, phonics,
  onboarding, closet,
  // Keep the legacy card grid reachable for diagnostics.
  homeLegacy: home,
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
  // First-launch UX: if the kid has never picked a buddy, send them
  // to onboarding. Otherwise straight to the world-map hub.
  ctx.navigate(hasBuddy() ? 'home' : 'onboarding');
  return ctx;
}

if (typeof document !== 'undefined' && document.getElementById('app')) {
  // Tick the daily reading streak the moment the app boots — opening
  // the app counts as showing up to read.
  try { tickStreak(); } catch (_) { /* noop */ }
  // Mount the shared SVG filter <defs> once before the first scene
  // paints so .crayola-bg picks up paper-grain immediately.
  try { mountSvgFilters(); } catch (_) { /* noop */ }
  createApp(document.getElementById('app'));
}
