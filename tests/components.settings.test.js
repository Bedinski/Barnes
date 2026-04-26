import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getSettings, setSetting, resetSettings, buildSettingsButton, _resetSettingsCache,
} from '../js/components/settings.js';

beforeEach(() => {
  _resetSettingsCache();
  globalThis.localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
});

test('default settings are sane and complete', () => {
  const s = getSettings();
  assert.equal(s.rate,     0.9);
  assert.equal(s.pitch,    1.1);
  assert.equal(s.sfxOn,    true);
  assert.equal(s.voiceOn,  true);
  assert.equal(s.autoRead, true);
});

test('setSetting persists and emits settings:changed', () => {
  let captured = null;
  document.addEventListener('settings:changed', (e) => { captured = e.detail; });
  setSetting('rate', 1.1);
  assert.equal(getSettings().rate, 1.1);
  assert.ok(captured);
  assert.equal(captured.key, 'rate');
  assert.equal(captured.value, 1.1);
  // Survives a cache reset (i.e. is on disk).
  _resetSettingsCache();
  assert.equal(getSettings().rate, 1.1);
});

test('resetSettings restores defaults', () => {
  setSetting('rate', 1.2);
  setSetting('voiceOn', false);
  resetSettings();
  const s = getSettings();
  assert.equal(s.rate,    0.9);
  assert.equal(s.voiceOn, true);
});

test('buildSettingsButton opens a modal with toggles + speed slider', () => {
  const btn = buildSettingsButton();
  document.body.appendChild(btn);
  btn.click();
  const modal = document.querySelector('.settings-modal');
  assert.ok(modal, 'modal should open');
  assert.ok(modal.querySelector('input[type="range"]'), 'speed slider present');
  const toggles = modal.querySelectorAll('.toggle');
  assert.ok(toggles.length >= 3, 'three toggles (voice/sfx/autoRead)');
  // Close and verify gone.
  modal.querySelector('.settings-close').click();
  assert.equal(document.querySelector('.settings-modal'), null);
});
