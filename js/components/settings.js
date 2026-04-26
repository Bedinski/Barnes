// User settings: read speed, voice pitch, sound effects on/off, narration
// on/off. Persisted in localStorage. Other modules read live values via
// getSettings() and listen for `settings:changed` to reactively update.

const KEY = 'kpr.settings';

const DEFAULTS = {
  rate:     0.9,    // speech rate; 0.6 = slow, 0.9 = normal, 1.2 = fast
  pitch:    1.1,
  sfxOn:    true,   // tap/success/tryAgain chimes
  voiceOn:  true,   // master switch for speech synthesis
  autoRead: true,   // auto-speak prompts on scene mount (vs manual via 🔊 button)
};

function load() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}')) };
  } catch (_) { return { ...DEFAULTS }; }
}

let cache = null;
function ensureCache() { if (!cache) cache = load(); return cache; }

export function getSettings() {
  return { ...ensureCache() };
}

export function setSetting(key, value) {
  const c = ensureCache();
  c[key] = value;
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(c)); }
  catch (_) { /* noop */ }
  document.dispatchEvent(new CustomEvent('settings:changed', { detail: { key, value, settings: { ...c } } }));
}

export function resetSettings() {
  cache = { ...DEFAULTS };
  try { globalThis.localStorage?.removeItem(KEY); }
  catch (_) { /* noop */ }
  document.dispatchEvent(new CustomEvent('settings:changed', { detail: { reset: true, settings: { ...cache } } }));
}

// A small modal panel that opens from the gear button.
export function buildSettingsButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--ghost gear-btn';
  btn.setAttribute('aria-label', 'Open settings');
  btn.title = 'Settings';
  btn.textContent = '⚙️';
  btn.addEventListener('click', openSettings);
  return btn;
}

let openModal = null;

function closeSettings() {
  if (openModal) { openModal.remove(); openModal = null; }
}

function openSettings() {
  if (openModal) return;
  const s = getSettings();

  const overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSettings(); });

  const modal = document.createElement('div');
  modal.className = 'settings-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Settings');

  modal.innerHTML = `
    <div class="settings-head">
      <h2>Settings</h2>
      <button type="button" class="btn btn--ghost settings-close" aria-label="Close settings">✕</button>
    </div>
    <div class="settings-body"></div>
  `;
  const body = modal.querySelector('.settings-body');

  const addRow = (labelText, control) => {
    const row = document.createElement('div');
    row.className = 'settings-row';
    const lbl = document.createElement('label');
    lbl.textContent = labelText;
    row.appendChild(lbl);
    row.appendChild(control);
    body.appendChild(row);
  };

  // Speed slider
  const speed = document.createElement('input');
  speed.type = 'range';
  speed.min = '0.6';
  speed.max = '1.2';
  speed.step = '0.05';
  speed.value = String(s.rate);
  speed.setAttribute('aria-label', 'Reading speed');
  const speedLabel = document.createElement('span');
  speedLabel.className = 'range-readout';
  const labelFor = (v) => v < 0.8 ? 'slow' : v > 1.05 ? 'fast' : 'normal';
  speedLabel.textContent = labelFor(s.rate);
  speed.addEventListener('input', () => {
    const v = parseFloat(speed.value);
    speedLabel.textContent = labelFor(v);
    setSetting('rate', v);
  });
  const speedWrap = document.createElement('div');
  speedWrap.className = 'range-wrap';
  speedWrap.appendChild(speed);
  speedWrap.appendChild(speedLabel);
  addRow('🐢🐰 Reading speed', speedWrap);

  // Toggles
  const mkToggle = (key, lbl) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'toggle ' + (s[key] ? 'is-on' : 'is-off');
    t.setAttribute('aria-pressed', String(!!s[key]));
    t.textContent = s[key] ? 'On' : 'Off';
    t.addEventListener('click', () => {
      const nv = !ensureCache()[key];
      setSetting(key, nv);
      t.classList.toggle('is-on', nv);
      t.classList.toggle('is-off', !nv);
      t.setAttribute('aria-pressed', String(nv));
      t.textContent = nv ? 'On' : 'Off';
    });
    addRow(lbl, t);
    return t;
  };
  mkToggle('voiceOn',  '🗣️ Speech');
  mkToggle('sfxOn',    '🔔 Sound effects');
  mkToggle('autoRead', '▶️ Auto-read pages');

  // Reset row
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn btn--ghost';
  reset.textContent = 'Reset to defaults';
  reset.addEventListener('click', () => { resetSettings(); closeSettings(); });
  addRow('', reset);

  modal.querySelector('.settings-close').addEventListener('click', closeSettings);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  openModal = overlay;
  // Focus close button for keyboard users.
  modal.querySelector('.settings-close').focus();
}

// Test seam.
export function _resetSettingsCache() { cache = null; }
