// Make a scene SVG come alive on tap.
//
// Walks the rendered scene-svg looking for two kinds of tappable things:
//   - Inner character SVGs (.character.koala / .character.panda) — tap
//     plays a short waveCheer reaction, speaks the species name, and
//     bumps the wordsTapped stat.
//   - Prop groups marked with data-label (sun, tree, log, ball, …) —
//     tap pulses the prop and speaks the label.
//
// This turns every book page into a hidden-object game without burdening
// the book authors: every existing scene becomes interactive for free.

import { attach as animate } from './animator.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound } from '../audio/sounds.js';
import { bumpStat } from '../components/badges.js';

function pulse(el) {
  if (typeof el.animate !== 'function') return;
  try {
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
      { duration: 360, easing: 'ease-out' },
    );
  } catch (_) { /* noop */ }
}

/**
 * @param {SVGElement} sceneSvg
 * @returns {() => void} cleanup that detaches the animator handles
 */
export function makeSceneInteractive(sceneSvg) {
  if (!sceneSvg) return () => {};
  const handles = [];

  // Characters: anything with .character class. We attach the animator so
  // it tracks the cursor and gets cheer/wiggle reactions.
  const chars = sceneSvg.querySelectorAll('.character');
  chars.forEach((c) => {
    c.style.cursor = 'pointer';
    const h = animate(c);
    handles.push(h);
    c.addEventListener('click', (e) => {
      e.stopPropagation();
      tapSound();
      const species = c.dataset.species || (c.classList.contains('koala') ? 'koala' : 'panda');
      h.cheer();
      speak(species);
      bumpStat('wordsTapped', 1);
    });
  });

  // Props: anything with data-label.
  const props = sceneSvg.querySelectorAll('[data-label]');
  props.forEach((p) => {
    p.style.cursor = 'pointer';
    p.addEventListener('click', (e) => {
      e.stopPropagation();
      tapSound();
      pulse(p);
      speak(p.dataset.label);
      bumpStat('wordsTapped', 1);
    });
  });

  return () => handles.forEach((h) => h.detach());
}
