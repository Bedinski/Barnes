// First-launch onboarding (Phase B). A kid-friendly 3-step flow:
//   1. Pick a species   (koala or panda)
//   2. Pick a fur tone  (variant — depends on species)
//   3. Pick a name      (from a suggestion list, with "🎲 Surprise me")
// Each step speaks a friendly prompt and shows the candidate buddy
// big and centered. Persists choices via setBuddy() and routes to the
// world map when done.
//
// We do NOT include accessory selection here — every default accessory
// is unlocked from day one, and the closet handles equipping. Keeping
// onboarding to 3 steps respects the "no-text required" Crayola rule
// (each step is a single tap with voice narration).

import { setBuddy, NAME_SUGGESTIONS } from '../components/buddy.js';
import { buildKoala } from '../characters/koala.js';
import { buildPanda } from '../characters/panda.js';
import { attach as animate } from '../characters/animator.js';
import { speak } from '../audio/speech.js';
import { tap as tapSound, success } from '../audio/sounds.js';

const SPECIES_OPTIONS = [
  { id: 'koala', label: 'Koala', defaultVariant: 'classic', defaultAccessory: 'leaf' },
  { id: 'panda', label: 'Panda', defaultVariant: 'classic', defaultAccessory: 'bamboo' },
];

const VARIANTS_BY_SPECIES = {
  koala: [
    { id: 'classic', label: 'Grey'  },
    { id: 'warm',    label: 'Warm'  },
    { id: 'blue',    label: 'Blue'  },
  ],
  panda: [
    { id: 'classic', label: 'Classic' },
    { id: 'pinky',   label: 'Pinky'   },
  ],
};

function buildCharacter(species, variant) {
  const opts = { variant, size: 'tall' };
  if (species === 'koala') return buildKoala({ ...opts, accessory: 'leaf' });
  return buildPanda({ ...opts, accessory: 'bamboo' });
}

export function mount(container, ctx) {
  container.innerHTML = '';
  const scene = document.createElement('section');
  scene.className = 'scene onboarding crayola-bg';

  let step = 1;
  let chosenSpecies = 'koala';
  let chosenVariant = 'classic';
  let chosenName    = NAME_SUGGESTIONS[0];

  const handles = [];
  const detachers = [];
  let speakTimer = null;

  const cleanup = () => {
    if (speakTimer) clearTimeout(speakTimer);
    handles.forEach((h) => { try { h.detach(); } catch (_) {} });
    handles.length = 0;
    detachers.forEach((fn) => { try { fn(); } catch (_) {} });
    detachers.length = 0;
  };

  // Render the current step in place. Cleanup is per-render so animator
  // handles don't leak when the kid moves between steps.
  function render() {
    cleanup();
    scene.innerHTML = '';

    const stage = document.createElement('div');
    stage.className = 'onb-stage';

    const prompt = document.createElement('h1');
    prompt.className = 'title title--hand onb-prompt';

    const character = document.createElement('div');
    character.className = 'onb-character';

    const choices = document.createElement('div');
    choices.className = 'onb-choices';

    if (step === 1) {
      prompt.textContent = 'Pick your reading buddy!';
      const preview = buildCharacter(chosenSpecies, chosenVariant);
      character.appendChild(preview);
      const h = animate(preview);
      handles.push(h);
      setTimeout(() => h.wave(), 250);

      SPECIES_OPTIONS.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn--big onb-choice crayon-edge';
        btn.dataset.choice = opt.id;
        btn.style.setProperty('--crayon-color', opt.id === 'koala' ? 'var(--c-purple)' : 'var(--c-blue)');
        btn.textContent = opt.label;
        const onClick = () => {
          tapSound();
          chosenSpecies = opt.id;
          chosenVariant = opt.defaultVariant;
          step = 2;
          render();
        };
        btn.addEventListener('click', onClick);
        detachers.push(() => btn.removeEventListener('click', onClick));
        choices.appendChild(btn);
      });

      speakTimer = setTimeout(() => speak('Pick your reading buddy! Tap koala or panda.'), 350);
    }

    else if (step === 2) {
      prompt.textContent = `Pick a color!`;
      const preview = buildCharacter(chosenSpecies, chosenVariant);
      character.appendChild(preview);
      const h = animate(preview);
      handles.push(h);

      const variants = VARIANTS_BY_SPECIES[chosenSpecies] || [];
      variants.forEach((v) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn--big onb-choice crayon-edge';
        btn.dataset.choice = v.id;
        btn.style.setProperty('--crayon-color', 'var(--c-orange)');
        if (v.id === chosenVariant) btn.classList.add('is-selected');
        btn.textContent = v.label;
        const onClick = () => {
          tapSound();
          chosenVariant = v.id;
          render();
        };
        btn.addEventListener('click', onClick);
        detachers.push(() => btn.removeEventListener('click', onClick));
        choices.appendChild(btn);
      });

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn btn--primary onb-next';
      next.dataset.choice = 'next';
      next.textContent = 'Next →';
      const onNext = () => {
        tapSound();
        step = 3;
        render();
      };
      next.addEventListener('click', onNext);
      detachers.push(() => next.removeEventListener('click', onNext));
      choices.appendChild(next);

      speakTimer = setTimeout(() => speak('Pick a color, then tap next.'), 350);
    }

    else if (step === 3) {
      prompt.textContent = 'Pick a name!';
      const preview = buildCharacter(chosenSpecies, chosenVariant);
      character.appendChild(preview);
      const h = animate(preview);
      handles.push(h);

      const nameDisplay = document.createElement('div');
      nameDisplay.className = 'onb-name-display title--hand';
      nameDisplay.dataset.role = 'name-display';
      nameDisplay.textContent = chosenName;

      NAME_SUGGESTIONS.forEach((name) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn onb-name-btn crayon-edge';
        btn.dataset.choice = name;
        if (name === chosenName) btn.classList.add('is-selected');
        btn.style.setProperty('--crayon-color', 'var(--c-pink)');
        btn.textContent = name;
        const onClick = () => {
          tapSound();
          chosenName = name;
          nameDisplay.textContent = name;
          choices.querySelectorAll('.onb-name-btn.is-selected')
            .forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
        };
        btn.addEventListener('click', onClick);
        detachers.push(() => btn.removeEventListener('click', onClick));
        choices.appendChild(btn);
      });

      const surprise = document.createElement('button');
      surprise.type = 'button';
      surprise.className = 'btn onb-surprise crayon-edge';
      surprise.dataset.choice = 'surprise';
      surprise.style.setProperty('--crayon-color', 'var(--c-purple)');
      surprise.textContent = '🎲 Surprise me';
      const onSurprise = () => {
        tapSound();
        const idx = Math.floor(Math.random() * NAME_SUGGESTIONS.length);
        chosenName = NAME_SUGGESTIONS[idx];
        nameDisplay.textContent = chosenName;
      };
      surprise.addEventListener('click', onSurprise);
      detachers.push(() => surprise.removeEventListener('click', onSurprise));
      choices.appendChild(surprise);

      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'btn btn--primary onb-done';
      done.dataset.choice = 'done';
      done.textContent = "I'm ready!";
      const onDone = () => {
        tapSound();
        const species = chosenSpecies;
        const accessoryDefault = SPECIES_OPTIONS.find((s) => s.id === species)?.defaultAccessory || null;
        setBuddy({
          species,
          variant:   chosenVariant,
          accessory: accessoryDefault,
          name:      chosenName,
        });
        try { success(); } catch (_) {}
        try { speak(`Hi ${chosenName}! Let's read.`); } catch (_) {}
        setTimeout(() => ctx.navigate('worldMap'), 250);
      };
      done.addEventListener('click', onDone);
      detachers.push(() => done.removeEventListener('click', onDone));

      stage.appendChild(nameDisplay);
      speakTimer = setTimeout(() => speak('Pick a name. Then tap, I am ready.'), 350);

      // The "done" button gets its own row below choices for visual emphasis.
      const doneRow = document.createElement('div');
      doneRow.className = 'onb-done-row';
      doneRow.appendChild(done);
      stage.dataset.doneRowAttached = 'true';
      // Append done row AFTER choices, below.
      // We'll add it after appending choices to stage.
      // Save it for later append:
      stage._doneRow = doneRow;
    }

    stage.prepend(prompt);
    stage.appendChild(character);
    stage.appendChild(choices);
    if (stage._doneRow) stage.appendChild(stage._doneRow);
    scene.appendChild(stage);
  }

  render();
  container.appendChild(scene);

  return () => {
    cleanup();
  };
}
