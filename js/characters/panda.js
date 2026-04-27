// Layered SVG panda factory.
// Mirrors the koala anatomy contract so animator.js can drive either.
// Distinguishing features: black ears, black eye-patches, black arms/legs,
// optional bamboo prop hugged in front.

const SVG_NS = 'http://www.w3.org/2000/svg';

const TONES = {
  classic: { white: '#ffffff', dark: '#222222', cheek: '#ffb3c1' },
  pinky:   { white: '#fff7f9', dark: '#2b2230', cheek: '#ff9fb6' },
};

export function buildPanda({ variant = 'classic', size = 'medium', accessory = null } = {}) {
  const tone = TONES[variant] || TONES.classic;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 220');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', `character panda size-${size} variant-${variant}`);
  svg.dataset.species = 'panda';
  svg.dataset.variant = variant;

  svg.innerHTML = `
    <!-- ears -->
    <g id="left-ear" class="left-ear">
      <circle cx="56" cy="58" r="22" fill="${tone.dark}" />
      <circle cx="56" cy="62" r="12" fill="#604848" />
    </g>
    <g id="right-ear" class="right-ear">
      <circle cx="144" cy="58" r="22" fill="${tone.dark}" />
      <circle cx="144" cy="62" r="12" fill="#604848" />
    </g>

    <!-- legs (black) -->
    <g id="left-leg" class="left-leg">
      <ellipse cx="72" cy="200" rx="22" ry="14" fill="${tone.dark}" />
    </g>
    <g id="right-leg" class="right-leg">
      <ellipse cx="128" cy="200" rx="22" ry="14" fill="${tone.dark}" />
    </g>

    <!-- body (white) — painterly highlight + shade overlay for depth -->
    <g id="body" class="body">
      <ellipse cx="100" cy="160" rx="62" ry="55" fill="${tone.white}" />
      <ellipse cx="100" cy="160" rx="62" ry="55" fill="url(#g-shade)" opacity="0.85" />
      <ellipse cx="84"  cy="138" rx="40" ry="22" fill="url(#g-highlight)" />
      <ellipse id="belly" class="belly" cx="100" cy="170" rx="42" ry="38" fill="#f7f1f1" />
      <ellipse cx="100" cy="170" rx="42" ry="38" fill="url(#g-shade)" opacity="0.55" />
      <ellipse cx="86"  cy="152" rx="22" ry="14" fill="url(#g-highlight)" opacity="0.7" />
    </g>

    <!-- arms (black, in front of body) -->
    <g id="left-arm" class="left-arm">
      <ellipse cx="44" cy="155" rx="18" ry="30" fill="${tone.dark}" transform="rotate(-15 44 155)" />
    </g>
    <g id="right-arm" class="right-arm">
      <ellipse cx="156" cy="155" rx="18" ry="30" fill="${tone.dark}" transform="rotate(15 156 155)" />
    </g>

    ${accessory === 'bamboo' ? `
      <g class="accessory bamboo-stalk">
        <rect x="92" y="120" width="16" height="80" rx="6" fill="#8fcf6f" />
        <rect x="92" y="135" width="16" height="6"  fill="#5a9c46" />
        <rect x="92" y="160" width="16" height="6"  fill="#5a9c46" />
        <rect x="92" y="185" width="16" height="6"  fill="#5a9c46" />
        <ellipse cx="86"  cy="115" rx="14" ry="6" fill="#7ab66b" transform="rotate(-30 86 115)"/>
        <ellipse cx="118" cy="115" rx="14" ry="6" fill="#7ab66b" transform="rotate(30 118 115)"/>
      </g>
    ` : ''}

    <!-- head -->
    <g id="head" class="head">
      <circle  cx="100" cy="100" r="60" fill="${tone.white}" />
      <circle  cx="100" cy="100" r="60" fill="url(#g-shade)" opacity="0.85" />
      <ellipse cx="80"  cy="76"  rx="36" ry="20" fill="url(#g-highlight)" />

      <!-- iconic black eye-patches -->
      <ellipse cx="78"  cy="100" rx="14" ry="18" fill="${tone.dark}" transform="rotate(-15 78 100)" />
      <ellipse cx="122" cy="100" rx="14" ry="18" fill="${tone.dark}" transform="rotate(15 122 100)" />

      <!-- eye whites inside the patches -->
      <ellipse class="eye-white" cx="78"  cy="100" rx="6" ry="8" fill="#ffffff" />
      <ellipse class="eye-white" cx="122" cy="100" rx="6" ry="8" fill="#ffffff" />

      <!-- pupils -->
      <g id="left-eye"  class="left-eye"><circle class="pupil" cx="78"  cy="102" r="3.5" fill="#000" /></g>
      <g id="right-eye" class="right-eye"><circle class="pupil" cx="122" cy="102" r="3.5" fill="#000" /></g>

      <!-- eyelids -->
      <g id="left-eyelid"  class="left-eyelid"><ellipse cx="78"  cy="100" rx="6" ry="8" fill="${tone.dark}" /></g>
      <g id="right-eyelid" class="right-eyelid"><ellipse cx="122" cy="100" rx="6" ry="8" fill="${tone.dark}" /></g>

      <!-- cheeks -->
      <g id="left-cheek"  class="left-cheek"><circle cx="62"  cy="125" r="7" fill="${tone.cheek}" opacity="0.6" /></g>
      <g id="right-cheek" class="right-cheek"><circle cx="138" cy="125" r="7" fill="${tone.cheek}" opacity="0.6" /></g>

      <!-- nose -->
      <g id="nose" class="nose">
        <ellipse cx="100" cy="125" rx="9" ry="6" fill="${tone.dark}" />
      </g>

      <!-- mouth -->
      <g id="mouth" class="mouth">
        <path class="mouth-closed" d="M 92 140 Q 100 148 108 140" stroke="${tone.dark}" stroke-width="3" fill="none" stroke-linecap="round" />
        <path class="mouth-open"   d="M 88 140 Q 100 156 112 140 Q 100 148 88 140 Z" fill="#7a2828" stroke="${tone.dark}" stroke-width="2" />
      </g>

      ${accessory === 'bow' ? `
        <g class="accessory bow">
          <circle cx="50" cy="60" r="6" fill="#ff5d8f" />
          <path d="M 36 60 L 50 60 L 44 50 Z" fill="#ff5d8f" />
          <path d="M 64 60 L 50 60 L 56 50 Z" fill="#ff5d8f" />
        </g>
      ` : ''}
      ${accessory === 'crown' ? `
        <g class="accessory crown">
          <path d="M 64 50 L 76 26 L 88 44 L 100 18 L 112 44 L 124 26 L 136 50 Z" fill="#ffd23f" stroke="#a07b00" stroke-width="2" stroke-linejoin="round" />
          <circle cx="100" cy="36" r="3.5" fill="#ef3e3e" />
          <circle cx="80"  cy="44" r="2.5" fill="#3aa6ff" />
          <circle cx="120" cy="44" r="2.5" fill="#54c45e" />
        </g>
      ` : ''}
      ${accessory === 'glasses' ? `
        <g class="accessory glasses">
          <circle cx="78"  cy="100" r="11" fill="none" stroke="${tone.dark}" stroke-width="3" />
          <circle cx="122" cy="100" r="11" fill="none" stroke="${tone.dark}" stroke-width="3" />
          <line x1="89" y1="100" x2="111" y2="100" stroke="${tone.dark}" stroke-width="3" />
        </g>
      ` : ''}
      ${accessory === 'scarf' ? `
        <g class="accessory scarf">
          <path d="M 56 152 Q 100 168 144 152 Q 144 168 100 174 Q 56 168 56 152 Z" fill="#3aa6ff" />
          <path d="M 132 168 L 152 200 L 138 200 Z" fill="#2378c8" />
        </g>
      ` : ''}
      ${accessory === 'flower' ? `
        <g class="accessory flower">
          <circle cx="58" cy="52" r="6" fill="#ff77b1" />
          <circle cx="64" cy="44" r="6" fill="#ff77b1" />
          <circle cx="74" cy="48" r="6" fill="#ff77b1" />
          <circle cx="70" cy="58" r="6" fill="#ff77b1" />
          <circle cx="60" cy="62" r="6" fill="#ff77b1" />
          <circle cx="66" cy="52" r="3" fill="#ffd23f" />
        </g>
      ` : ''}
    </g>
  `;

  return svg;
}
