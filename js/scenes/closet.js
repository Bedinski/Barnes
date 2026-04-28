// Closet (Phase B). The kid sees their buddy big and centered, and a
// grid of accessories filtered to their species. Locked accessories
// show a 🔒 + a kid-readable hint ("Read 3 books!"). Tapping an
// unlocked accessory equips it; the buddy preview re-renders and a
// soft success chime plays. Tapping again unequips. Back button
// returns to the world-map hub.

import {
  buildBuddy, getBuddy, setBuddy,
  isAccessoryUnlocked,
} from '../components/buddy.js?v=5';
import { ACCESSORIES } from '../data/accessories.js';
import { attach as animate } from '../characters/animator.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound, success } from '../audio/sounds.js';

function unlockHint(acc) {
  const u = acc.unlock || {};
  if (u.type === 'default') return 'Ready to wear';
  if (u.type === 'stat') {
    const friendly = ({
      booksRead:     'Read books',
      pagesMastered: 'Master pages',
      wordsTapped:   'Tap words',
      starsAwarded:  'Earn stars',
      rounds:        'Play rounds',
    })[u.key] || u.key;
    return `${friendly} (${u.n})`;
  }
  if (u.type === 'badge') return `Earn the ${u.id} badge`;
  return '';
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene closet crayola-bg';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('worldMap'); });
  top.appendChild(back);

  const title = document.createElement('h1');
  title.className = 'title title--hand';
  title.textContent = 'Closet';
  top.appendChild(title);
  scene.appendChild(top);

  const stage = document.createElement('div');
  stage.className = 'closet-stage';

  // Buddy preview, big.
  const previewWrap = document.createElement('div');
  previewWrap.className = 'closet-preview';

  let previewSvg = buildBuddy({ size: 'tall' });
  previewWrap.appendChild(previewSvg);
  let previewHandle = animate(previewSvg);

  const refreshPreview = () => {
    try { previewHandle.detach(); } catch (_) {}
    previewWrap.innerHTML = '';
    previewSvg = buildBuddy({ size: 'tall' });
    previewWrap.appendChild(previewSvg);
    previewHandle = animate(previewSvg);
    setTimeout(() => { try { previewHandle.cheer(); } catch (_) {} }, 80);
  };

  stage.appendChild(previewWrap);

  // Accessory grid — filtered to the buddy's species.
  const grid = document.createElement('div');
  grid.className = 'closet-grid';

  const handlerCleanups = [];

  function renderGrid() {
    grid.innerHTML = '';
    const buddy = getBuddy();
    const speciesAccessories = ACCESSORIES.filter((a) => a.species.includes(buddy.species));
    speciesAccessories.forEach((acc) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'closet-cell crayon-edge';
      cell.dataset.accessoryId = acc.id;
      const unlocked = isAccessoryUnlocked(acc.id);
      const equipped = buddy.accessory === acc.id;
      cell.classList.toggle('is-locked',   !unlocked);
      cell.classList.toggle('is-equipped', equipped);
      cell.style.setProperty('--crayon-color',
        unlocked ? (equipped ? 'var(--c-green)' : 'var(--c-orange)')
                 : 'var(--c-paper-edge)');
      cell.setAttribute('aria-label', `${acc.label}${unlocked ? '' : ' — locked'}`);
      cell.innerHTML = `
        <div class="cell-glyph">${unlocked ? '✨' : '🔒'}</div>
        <div class="cell-label">${acc.label}</div>
        <div class="cell-hint">${unlocked ? (equipped ? 'Wearing' : 'Tap to wear') : unlockHint(acc)}</div>
      `;
      const onClick = () => {
        tapSound();
        if (!unlocked) {
          try { speak(`${acc.label}. ${unlockHint(acc)}.`); } catch (_) {}
          return;
        }
        // Toggle equip/unequip.
        const next = equipped ? null : acc.id;
        setBuddy({ accessory: next });
        try { success(); } catch (_) {}
        try { speak(equipped ? 'Took it off!' : `You're wearing the ${acc.label}!`); } catch (_) {}
        renderGrid();
        refreshPreview();
      };
      cell.addEventListener('click', onClick);
      handlerCleanups.push(() => cell.removeEventListener('click', onClick));
      grid.appendChild(cell);
    });
  }

  renderGrid();
  stage.appendChild(grid);
  scene.appendChild(stage);
  container.appendChild(scene);

  setTimeout(() => { try { speak('Pick something to wear!'); } catch (_) {} }, 350);

  return () => {
    handlerCleanups.forEach((fn) => fn());
    try { previewHandle.detach(); } catch (_) {}
  };
}
