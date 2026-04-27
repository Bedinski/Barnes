// Layered SVG koala factory.
// Returns an <svg> element whose direct children are named groups
// (#body, #head, #left-ear, #right-ear, #left-eye, #right-eye,
//  #left-eyelid, #right-eyelid, #left-cheek, #right-cheek, #nose, #mouth,
//  #left-arm, #right-arm, #left-leg, #right-leg, #belly).
// The animator (characters/animator.js) targets these groups by class so
// every part can animate independently.

const SVG_NS = 'http://www.w3.org/2000/svg';

const FUR_TONES = {
  classic: { fur: '#b9b9c4', shade: '#9a9aa8' },
  warm:    { fur: '#c9beb6', shade: '#a89c92' },
  blue:    { fur: '#bfd6e8', shade: '#9bb8cd' },
};

export function buildKoala({ variant = 'classic', size = 'medium', accessory = null } = {}) {
  const tone = FUR_TONES[variant] || FUR_TONES.classic;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 220');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', `character koala size-${size} variant-${variant}`);
  svg.dataset.species = 'koala';
  svg.dataset.variant = variant;

  svg.innerHTML = `
    <!-- ears (drawn first so head overlaps) -->
    <g id="left-ear" class="left-ear">
      <ellipse cx="48" cy="68" rx="34" ry="32" fill="${tone.fur}" />
      <ellipse cx="48" cy="74" rx="22" ry="20" fill="#f7d7d7" />
      <ellipse cx="48" cy="74" rx="14" ry="12" fill="#ffeaea" />
    </g>
    <g id="right-ear" class="right-ear">
      <ellipse cx="152" cy="68" rx="34" ry="32" fill="${tone.fur}" />
      <ellipse cx="152" cy="74" rx="22" ry="20" fill="#f7d7d7" />
      <ellipse cx="152" cy="74" rx="14" ry="12" fill="#ffeaea" />
    </g>

    <!-- legs (behind body) -->
    <g id="left-leg" class="left-leg">
      <ellipse cx="72" cy="200" rx="22" ry="14" fill="${tone.shade}" />
    </g>
    <g id="right-leg" class="right-leg">
      <ellipse cx="128" cy="200" rx="22" ry="14" fill="${tone.shade}" />
    </g>

    <!-- body -->
    <g id="body" class="body">
      <ellipse cx="100" cy="160" rx="62" ry="55" fill="${tone.fur}" />
      <ellipse id="belly" class="belly" cx="100" cy="170" rx="42" ry="38" fill="var(--c-koala-belly)" />
    </g>

    <!-- arms (over body) -->
    <g id="left-arm" class="left-arm">
      <ellipse cx="44" cy="155" rx="18" ry="28" fill="${tone.shade}" transform="rotate(-15 44 155)" />
    </g>
    <g id="right-arm" class="right-arm">
      <ellipse cx="156" cy="155" rx="18" ry="28" fill="${tone.shade}" transform="rotate(15 156 155)" />
    </g>

    <!-- head -->
    <g id="head" class="head">
      <ellipse cx="100" cy="100" rx="62" ry="58" fill="${tone.fur}" />

      <!-- eye whites -->
      <ellipse class="eye-white" cx="78"  cy="98" rx="11" ry="13" fill="#ffffff" />
      <ellipse class="eye-white" cx="122" cy="98" rx="11" ry="13" fill="#ffffff" />

      <!-- pupils (animator nudges cx/cy to track cursor) -->
      <g id="left-eye"  class="left-eye"><circle class="pupil" cx="78"  cy="100" r="5" fill="#1a1a1a" /></g>
      <g id="right-eye" class="right-eye"><circle class="pupil" cx="122" cy="100" r="5" fill="#1a1a1a" /></g>

      <!-- eyelids — scaleY 0 by default, blink animation expands to 1 -->
      <g id="left-eyelid"  class="left-eyelid"><ellipse cx="78"  cy="98" rx="11" ry="13" fill="${tone.fur}" /></g>
      <g id="right-eyelid" class="right-eyelid"><ellipse cx="122" cy="98" rx="11" ry="13" fill="${tone.fur}" /></g>

      <!-- cheeks -->
      <g id="left-cheek"  class="left-cheek"><circle cx="68"  cy="118" r="8" fill="var(--c-cheek)" opacity="0.55" /></g>
      <g id="right-cheek" class="right-cheek"><circle cx="132" cy="118" r="8" fill="var(--c-cheek)" opacity="0.55" /></g>

      <!-- big koala nose -->
      <g id="nose" class="nose">
        <ellipse cx="100" cy="120" rx="20" ry="16" fill="#1a1a1a" />
        <ellipse cx="93" cy="115" rx="4" ry="3" fill="#ffffff" opacity="0.6" />
      </g>

      <!-- mouth — closed-smile + open-mouth, animator toggles via .is-talking -->
      <g id="mouth" class="mouth">
        <path class="mouth-closed" d="M 88 138 Q 100 148 112 138" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
        <path class="mouth-open"   d="M 88 138 Q 100 156 112 138 Q 100 148 88 138 Z" fill="#7a2828" stroke="#1a1a1a" stroke-width="2" />
      </g>

      ${accessory === 'leaf' ? `
        <g class="accessory leaf">
          <path d="M 60 50 Q 78 30 96 48 Q 80 56 60 50 Z" fill="#6dbf6a" />
          <line x1="62" y1="49" x2="92" y2="50" stroke="#3f7e3d" stroke-width="1.5" />
        </g>
      ` : ''}
      ${accessory === 'hat' ? `
        <g class="accessory hat">
          <ellipse cx="100" cy="50" rx="42" ry="8" fill="#d23b3b" />
          <path d="M 70 50 Q 100 -2 130 50 Z" fill="#d23b3b" />
        </g>
      ` : ''}
      ${accessory === 'crown' ? `
        <g class="accessory crown">
          <path d="M 64 56 L 76 32 L 88 50 L 100 24 L 112 50 L 124 32 L 136 56 Z" fill="#ffd23f" stroke="#a07b00" stroke-width="2" stroke-linejoin="round" />
          <circle cx="100" cy="42" r="3.5" fill="#ef3e3e" />
          <circle cx="80"  cy="50" r="2.5" fill="#3aa6ff" />
          <circle cx="120" cy="50" r="2.5" fill="#54c45e" />
        </g>
      ` : ''}
      ${accessory === 'glasses' ? `
        <g class="accessory glasses">
          <circle cx="78"  cy="100" r="14" fill="none" stroke="#1a1a1a" stroke-width="3" />
          <circle cx="122" cy="100" r="14" fill="none" stroke="#1a1a1a" stroke-width="3" />
          <line x1="92" y1="100" x2="108" y2="100" stroke="#1a1a1a" stroke-width="3" />
        </g>
      ` : ''}
      ${accessory === 'scarf' ? `
        <g class="accessory scarf">
          <path d="M 56 152 Q 100 168 144 152 Q 144 168 100 174 Q 56 168 56 152 Z" fill="#a672ff" />
          <path d="M 132 168 L 152 200 L 138 200 Z" fill="#7b4dd0" />
        </g>
      ` : ''}
      ${accessory === 'flower' ? `
        <g class="accessory flower">
          <circle cx="58" cy="58" r="6" fill="#ff77b1" />
          <circle cx="64" cy="50" r="6" fill="#ff77b1" />
          <circle cx="74" cy="54" r="6" fill="#ff77b1" />
          <circle cx="70" cy="64" r="6" fill="#ff77b1" />
          <circle cx="60" cy="68" r="6" fill="#ff77b1" />
          <circle cx="66" cy="58" r="3" fill="#ffd23f" />
        </g>
      ` : ''}
    </g>
  `;

  return svg;
}
