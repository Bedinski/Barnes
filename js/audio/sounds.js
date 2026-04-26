// Tiny WebAudio chimes for game feedback. No external assets — every sound
// is synthesized on the fly with oscillators + a quick gain envelope.
// Falls back to a no-op when AudioContext is unavailable.
//
// All sounds respect the user's "Sound effects" toggle in Settings.

let ctx = null;
let settingsRef = null;
async function ensureSettings() {
  if (settingsRef !== null) return settingsRef;
  try { settingsRef = await import('../components/settings.js'); }
  catch (_) { settingsRef = false; }
  return settingsRef;
}
function sfxMuted() {
  if (settingsRef && typeof settingsRef.getSettings === 'function') {
    return settingsRef.getSettings().sfxOn === false;
  }
  ensureSettings();
  return false;
}

function getCtx() {
  if (ctx) return ctx;
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch (_) {
    ctx = null;
  }
  return ctx;
}

function tone(freq, duration, { type = 'sine', gain = 0.18, when = 0 } = {}) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(env).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// Cheerful arpeggio — used when the child gets a correct answer.
export function success() {
  if (sfxMuted()) return;
  tone(523.25, 0.18, { type: 'triangle', when: 0.00 }); // C5
  tone(659.25, 0.18, { type: 'triangle', when: 0.10 }); // E5
  tone(783.99, 0.30, { type: 'triangle', when: 0.22 }); // G5
}

// Soft "uh-oh" — used for wrong answers. Never harsh.
export function tryAgain() {
  if (sfxMuted()) return;
  tone(440.00, 0.18, { type: 'sine', when: 0.00, gain: 0.14 }); // A4
  tone(349.23, 0.30, { type: 'sine', when: 0.16, gain: 0.14 }); // F4
}

// Quick blip — used for tap acknowledgements (tile drops, button taps).
export function tap() {
  if (sfxMuted()) return;
  tone(880.00, 0.06, { type: 'square', when: 0, gain: 0.08 });
}
