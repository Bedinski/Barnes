// Web Speech API wrapper. Speaks text aloud at a child-friendly pace and
// dispatches `speech:start` / `speech:end` events so the active mascot can
// sync its mouth animation. Degrades gracefully when speechSynthesis is
// unavailable (older browsers, JSDOM in tests, muted autoplay policies).

const DEFAULT_OPTS = { rate: 0.85, pitch: 1.2, volume: 1 };

let cachedVoice = null;

function pickVoice() {
  if (cachedVoice) return cachedVoice;
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof synth.getVoices !== 'function') return null;
  const voices = synth.getVoices() || [];
  const preferred = voices.find(
    (v) => /child|kid|junior/i.test(v.name) && /^en/i.test(v.lang),
  );
  const enFemale = voices.find(
    (v) => /^en/i.test(v.lang) && /female|samantha|karen|moira|tessa/i.test(v.name),
  );
  const enAny = voices.find((v) => /^en/i.test(v.lang));
  cachedVoice = preferred || enFemale || enAny || null;
  return cachedVoice;
}

function fireEvent(name, detail) {
  if (typeof globalThis.dispatchEvent === 'function') {
    try {
      globalThis.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (_) {
      // CustomEvent unavailable in some environments — ignore.
    }
  }
}

export function isSpeechAvailable() {
  return !!(globalThis.speechSynthesis && globalThis.SpeechSynthesisUtterance);
}

export function speak(text, opts = {}) {
  if (!text) return false;
  if (!isSpeechAvailable()) {
    // Still fire events so visual sync code can be tested headlessly.
    fireEvent('speech:start', { text });
    fireEvent('speech:end',   { text });
    return false;
  }
  const synth = globalThis.speechSynthesis;
  // Cancel any in-flight utterance so prompts don't pile up.
  try { synth.cancel(); } catch (_) { /* noop */ }

  const utter = new globalThis.SpeechSynthesisUtterance(String(text));
  const o = { ...DEFAULT_OPTS, ...opts };
  utter.rate   = o.rate;
  utter.pitch  = o.pitch;
  utter.volume = o.volume;
  const voice = pickVoice();
  if (voice) utter.voice = voice;

  utter.onstart = () => fireEvent('speech:start', { text });
  utter.onend   = () => fireEvent('speech:end',   { text });
  utter.onerror = () => fireEvent('speech:end',   { text, error: true });

  synth.speak(utter);
  return true;
}

export function cancelSpeech() {
  if (isSpeechAvailable()) {
    try { globalThis.speechSynthesis.cancel(); } catch (_) { /* noop */ }
  }
}

// Test seam — clear cached voice so re-pick on next speak().
export function _resetVoiceCache() {
  cachedVoice = null;
}
