// Web Speech API wrapper. Speaks text aloud at a child-friendly pace and
// dispatches `speech:start` / `speech:end` events so the active mascot can
// sync its mouth animation.
//
// Voice selection is centralised here so EVERY mode in the app sounds the
// same — the reader used to bypass this module, which is why it rendered
// with the robotic system-default voice while the other modes used the
// nice one. All speech now goes through speak().
//
// Degrades gracefully when speechSynthesis is unavailable (older browsers,
// JSDOM in tests, muted autoplay policies).

const DEFAULT_OPTS = { rate: 0.9, pitch: 1.1, volume: 1 };

// Read live user settings without creating an import cycle. Settings
// module is small and side-effect-free at import time.
let settingsRef = null;
async function ensureSettings() {
  if (settingsRef !== null) return settingsRef;
  try {
    const mod = await import('../components/settings.js');
    settingsRef = mod;
  } catch (_) {
    settingsRef = false;
  }
  return settingsRef;
}
function liveSettings() {
  // Best-effort sync read; if the dynamic import hasn't resolved yet, fall
  // back to defaults. Since speech is fired on user interaction (which
  // happens long after page load), settings will normally be loaded.
  if (settingsRef && typeof settingsRef.getSettings === 'function') {
    return settingsRef.getSettings();
  }
  // Kick off the import for next time.
  ensureSettings();
  return null;
}

// Priority-ordered lists of voice-name substrings we consider high-quality.
// macOS / iOS / Safari ship Samantha, Karen, Moira, Ava, Allison.  Chrome
// on desktop ships "Google US English".  Edge ships Microsoft neural voices
// (Jenny, Aria, Zira, Jane).  Anything labelled (Enhanced|Premium|Natural|
// Neural) is preferred over the legacy robotic voices (eSpeak, etc).
const PREFERRED_NAMES = [
  /google\s+us\s+english/i,
  /samantha/i,
  /ava/i,
  /allison/i,
  /susan/i,
  /victoria/i,
  /karen/i,
  /moira/i,
  /tessa/i,
  /serena/i,
  /jenny/i,
  /aria/i,
  /zira/i,
  /jane/i,
  /catherine/i,
];
const QUALITY_TAGS  = /\b(enhanced|premium|natural|neural|online)\b/i;
const AVOID_TAGS    = /\b(espeak|mbrola|pico|festival|flite)\b/i;

let cachedVoice = null;
let voicesReadyWired = false;

function allEnglishVoices() {
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof synth.getVoices !== 'function') return [];
  const voices = synth.getVoices() || [];
  return voices.filter((v) => /^en\b|^en[-_]/i.test(v.lang));
}

function pickVoice() {
  if (cachedVoice) return cachedVoice;
  const english = allEnglishVoices();
  if (english.length === 0) return null;

  // 1. A named high-quality voice.
  for (const rx of PREFERRED_NAMES) {
    const hit = english.find((v) => rx.test(v.name) && !AVOID_TAGS.test(v.name));
    if (hit) { cachedVoice = hit; return cachedVoice; }
  }
  // 2. Any English voice explicitly tagged "Enhanced / Natural / Neural".
  const tagged = english.find((v) => QUALITY_TAGS.test(v.name) && !AVOID_TAGS.test(v.name));
  if (tagged) { cachedVoice = tagged; return cachedVoice; }
  // 3. A female-sounding English voice by heuristic name match.
  const feminine = english.find(
    (v) => /female|woman|girl|lady|samantha|karen|victoria|ava|allison|jenny|aria/i.test(v.name)
      && !AVOID_TAGS.test(v.name),
  );
  if (feminine) { cachedVoice = feminine; return cachedVoice; }
  // 4. Anything English that isn't on the avoid list.
  const notRobot = english.find((v) => !AVOID_TAGS.test(v.name));
  cachedVoice = notRobot || english[0];
  return cachedVoice;
}

// Voices often load asynchronously — wire voiceschanged exactly once so the
// first speak() call after voices arrive re-picks and caches the good one.
function ensureVoicesReady() {
  if (voicesReadyWired) return;
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof synth.addEventListener !== 'function') return;
  voicesReadyWired = true;
  const handler = () => { cachedVoice = null; pickVoice(); };
  try { synth.addEventListener('voiceschanged', handler); } catch (_) { /* noop */ }
}

function fireEvent(name, detail) {
  if (typeof globalThis.dispatchEvent === 'function') {
    try {
      globalThis.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (_) { /* noop */ }
  }
}

export function isSpeechAvailable() {
  return !!(globalThis.speechSynthesis && globalThis.SpeechSynthesisUtterance);
}

export function getPreferredVoice() {
  ensureVoicesReady();
  return pickVoice();
}

/**
 * Speak `text` aloud with the picked voice and child-friendly defaults.
 *
 * opts:
 *   rate, pitch, volume — standard SpeechSynthesisUtterance props
 *   onBoundary(index)   — optional; called with the 0-based word index as
 *                         each word begins speaking (for highlighting).
 *                         Synthesized via a timed fallback when the browser
 *                         doesn't fire native boundary events.
 *
 * Returns a cancel function that stops this utterance.
 */
export function speak(text, opts = {}) {
  if (!text) return () => {};
  ensureVoicesReady();

  // Honor user settings: if speech is muted, behave like unavailable
  // synthesis (still fires events / synthetic boundaries so highlight UI
  // still walks through the words for visual reinforcement).
  const live = liveSettings();
  const speechMuted = live && live.voiceOn === false;

  const onBoundary = typeof opts.onBoundary === 'function' ? opts.onBoundary : null;

  if (speechMuted || !isSpeechAvailable()) {
    fireEvent('speech:start', { text });
    if (onBoundary) {
      // Replay boundaries synthetically so UI tests / JSDOM still exercise
      // the highlight code path.
      const wordCount = (String(text).match(/\w+/g) || []).length;
      for (let i = 0; i < wordCount; i++) onBoundary(i);
    }
    fireEvent('speech:end', { text });
    return () => {};
  }

  const synth = globalThis.speechSynthesis;
  try { synth.cancel(); } catch (_) { /* noop */ }

  const utter = new globalThis.SpeechSynthesisUtterance(String(text));
  // User-set rate/pitch override module defaults (and module defaults
  // override the hardcoded constants). Caller-provided opts win over all.
  const o = { ...DEFAULT_OPTS, ...(live || {}), ...opts };
  utter.rate   = o.rate;
  utter.pitch  = o.pitch;
  utter.volume = o.volume;
  const voice = pickVoice();
  if (voice) utter.voice = voice;

  let cancelled  = false;
  let fallbackId = null;
  let gotNativeBoundary = false;
  const words = (String(text).match(/\w+/g) || []);

  const startTimedFallback = () => {
    if (!onBoundary || cancelled) return;
    // Rough phoneme pacing: ~360ms per word at rate 0.9 — close enough for
    // highlight sync when the browser doesn't fire native boundaries.
    let i = 0;
    const tick = () => {
      if (cancelled || i >= words.length) return;
      onBoundary(i);
      i++;
      fallbackId = setTimeout(tick, 360);
    };
    tick();
  };

  if (onBoundary) {
    utter.onboundary = (e) => {
      if (e && e.name === 'word') {
        gotNativeBoundary = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        // `e.charIndex` points at the character where the word starts.
        // Count word tokens up to that index.
        const upTo = String(text).slice(0, e.charIndex);
        const idx  = (upTo.match(/\w+/g) || []).length;
        onBoundary(idx);
      }
    };
  }

  utter.onstart = () => {
    fireEvent('speech:start', { text });
    if (onBoundary) {
      // Only use the timed fallback if the engine hasn't started firing
      // native boundaries within 400ms.
      setTimeout(() => { if (!gotNativeBoundary && !cancelled) startTimedFallback(); }, 400);
    }
  };
  utter.onend   = () => {
    if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
    fireEvent('speech:end', { text });
  };
  utter.onerror = () => {
    if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
    fireEvent('speech:end', { text, error: true });
  };

  synth.speak(utter);

  return () => {
    cancelled = true;
    if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
    try { synth.cancel(); } catch (_) { /* noop */ }
  };
}

export function cancelSpeech() {
  if (isSpeechAvailable()) {
    try { globalThis.speechSynthesis.cancel(); } catch (_) { /* noop */ }
  }
}

// Test seam — clear cached voice so re-pick on next speak().
export function _resetVoiceCache() {
  cachedVoice = null;
  voicesReadyWired = false;
}
