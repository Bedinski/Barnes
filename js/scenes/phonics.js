// "Sound it Out" — CVC phonics mode.
//
// Three sub-views, navigated within this scene (no router involved):
//   1. Family picker — grid of word-family cards (-at, -an, -ig …)
//   2. Blender       — for the chosen family, show each word as
//                      tappable letters; tap a letter to hear its sound,
//                      tap "Sound it out" to blend slowly into the word
//   3. Match game    — show an emoji + 3 word options, child taps the
//                      matching CVC word; correct = star + bumpStat.
//
// The blender drives the Science-of-Reading core skill: connect letters
// to sounds, swap onsets while keeping the rime constant, decode the
// whole word.

import { FAMILIES, getFamily, phonemeFor } from '../data/phonics.js';
import { buildStarCounter, rewardStar } from '../components/stars.js';
import { BuddyCorner } from '../components/buddy.js?v=4';
import { bumpStat } from '../components/badges.js';
import { speak } from '../audio/speech.js';
import { success, tryAgain, tap as tapSound } from '../audio/sounds.js';

function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene phonics';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Home';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('home'); });
  top.appendChild(back);
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'Sound it Out';
  title.style.margin = '0';
  top.appendChild(title);
  top.appendChild(buildStarCounter());
  scene.appendChild(top);
  scene.appendChild(BuddyCorner({ size: 'chibi' }));

  const body = document.createElement('div');
  body.className = 'phonics-body';
  scene.appendChild(body);
  container.appendChild(scene);

  // ---- View 1: family picker -----------------------------------------
  const renderPicker = () => {
    body.innerHTML = '';
    const lead = document.createElement('p');
    lead.className = 'phonics-lead';
    lead.textContent = 'Pick a sound family.';
    body.appendChild(lead);

    const grid = document.createElement('div');
    grid.className = 'family-grid';
    FAMILIES.forEach((f) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'family-card';
      card.dataset.familyId = f.id;
      card.innerHTML = `<span class="rime">-${f.rime}</span>
                       <span class="words">${f.words.slice(0, 3).map((w) => w.emoji).join(' ')}</span>`;
      card.addEventListener('click', () => {
        tapSound();
        renderBlender(f.id);
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);
    setTimeout(() => speak('Pick a sound family.'), 250);
  };

  // ---- View 2: blender -----------------------------------------------
  const renderBlender = (familyId) => {
    const family = getFamily(familyId);
    if (!family) { renderPicker(); return; }
    body.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'phonics-subhead';
    head.innerHTML = `Words that end in <strong>-${family.rime}</strong>`;
    body.appendChild(head);

    const list = document.createElement('div');
    list.className = 'phonics-words';

    family.words.forEach((w) => {
      const row = document.createElement('div');
      row.className = 'phonics-word-row';

      const emoji = document.createElement('span');
      emoji.className = 'phonics-emoji';
      emoji.textContent = w.emoji;
      row.appendChild(emoji);

      const letterRow = document.createElement('span');
      letterRow.className = 'phonics-letters';
      const letterEls = [];
      [...w.word].forEach((ch) => {
        const lc = document.createElement('button');
        lc.type = 'button';
        lc.className = 'phonics-letter';
        lc.textContent = ch.toUpperCase();
        lc.dataset.letter = ch;
        lc.addEventListener('click', () => {
          tapSound();
          lc.classList.add('is-highlight');
          speak(phonemeFor(ch));
          setTimeout(() => lc.classList.remove('is-highlight'), 700);
        });
        letterRow.appendChild(lc);
        letterEls.push(lc);
      });
      row.appendChild(letterRow);

      const blend = document.createElement('button');
      blend.type = 'button';
      blend.className = 'btn';
      blend.textContent = '🔊 Sound it out';
      blend.addEventListener('click', () => {
        tapSound();
        bumpStat('rounds', 0); // no-op bump (avoids unused import warning); rounds is bumped on quiz
        // Walk through each letter slowly, then say the whole word.
        const letters = [...w.word];
        let i = 0;
        const tick = () => {
          letterEls.forEach((el) => el.classList.remove('is-highlight'));
          if (i < letters.length) {
            letterEls[i].classList.add('is-highlight');
            speak(phonemeFor(letters[i]));
            i++;
            setTimeout(tick, 700);
          } else {
            setTimeout(() => {
              letterEls.forEach((el) => el.classList.remove('is-highlight'));
              speak(w.word);
            }, 250);
          }
        };
        tick();
      });
      row.appendChild(blend);
      list.appendChild(row);
    });

    body.appendChild(list);

    const actions = document.createElement('div');
    actions.className = 'phonics-actions';
    const playBtn = document.createElement('button');
    playBtn.className = 'btn btn--big';
    playBtn.textContent = '🎯 Now play the game';
    playBtn.addEventListener('click', () => { tapSound(); renderMatch(family); });
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn--ghost';
    backBtn.textContent = '← Different family';
    backBtn.addEventListener('click', () => { tapSound(); renderPicker(); });
    actions.appendChild(backBtn);
    actions.appendChild(playBtn);
    body.appendChild(actions);

    setTimeout(() => speak(`Words that end in ${family.rime}.`), 200);
  };

  // ---- View 3: match game --------------------------------------------
  const renderMatch = (family) => {
    body.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'phonics-subhead';
    head.textContent = 'Tap the word that matches the picture!';
    body.appendChild(head);

    const next = () => {
      // Pick a random word from THIS family, then 2 distractors —
      // prefer same family (keeps the rime focus), fall back to other
      // family words.
      const target = family.words[Math.floor(Math.random() * family.words.length)];
      const others = shuffle(family.words.filter((w) => w.word !== target.word)).slice(0, 2);
      // If family is too small (e.g. -og has 3), we already get 2.
      const options = shuffle([target, ...others]);

      body.innerHTML = '';
      body.appendChild(head);

      const card = document.createElement('div');
      card.className = 'phonics-match-art';
      card.textContent = target.emoji;
      body.appendChild(card);

      const tray = document.createElement('div');
      tray.className = 'tile-tray';
      options.forEach((opt) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'tile';
        tile.textContent = opt.word;
        tile.dataset.word = opt.word;
        tile.addEventListener('click', () => {
          tapSound();
          if (opt.word === target.word) {
            success();
            rewardStar();
            bumpStat('rounds', 1);
            speak(target.word);
            setTimeout(next, 1400);
          } else {
            tryAgain();
            tile.classList.add('is-wrong');
            setTimeout(() => tile.classList.remove('is-wrong'), 500);
            speak('Try again.');
          }
        });
        tray.appendChild(tile);
      });
      body.appendChild(tray);
      setTimeout(() => speak(target.word), 200);
    };

    const actions = document.createElement('div');
    actions.className = 'phonics-actions';
    const back = document.createElement('button');
    back.className = 'btn btn--ghost';
    back.textContent = '← Practice more';
    back.addEventListener('click', () => { tapSound(); renderBlender(family.id); });
    actions.appendChild(back);
    body.appendChild(actions);

    next();
  };

  renderPicker();
  return () => {};
}
