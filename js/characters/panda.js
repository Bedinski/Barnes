// Octopus Hero (formerly the panda builder).
//
// Sea-hero reskin — for backward compatibility with tests, scene art,
// and persisted buddy state, the file/function/species id stays
// "panda". Visually it's now an octopus hero: round mantle (head + body
// merged), four upper tentacles (two raised as arms, two as ears for
// the idle-twitch animation), and four lower tentacles for legs. A
// hero mask wraps the eyes by default and the existing accessory keys
// (bow, crown, glasses, scarf, flower, bamboo) become themed gear.

const SVG_NS = 'http://www.w3.org/2000/svg';

const OCTO_TONES = {
  // Default: violet octopus hero.
  classic: { skin: '#a672ff', shade: '#6a3fc4', belly: '#ecdcff' },
  // Pinky variant: cherry-pink octopus hero.
  pinky:   { skin: '#ff77b1', shade: '#c4477f', belly: '#ffe4ee' },
};

export function buildPanda({ variant = 'classic', size = 'medium', accessory = null } = {}) {
  const tone = OCTO_TONES[variant] || OCTO_TONES.classic;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 220');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', `character panda size-${size} variant-${variant}`);
  svg.dataset.species = 'panda';
  svg.dataset.variant = variant;

  // Reusable suction-cup row markup. Two rows of 3 cups each.
  const cups = (cx, cy, color) => `
    <circle cx="${cx-6}" cy="${cy}"   r="2.2" fill="${color}" />
    <circle cx="${cx}"   cy="${cy+1}" r="2.2" fill="${color}" />
    <circle cx="${cx+6}" cy="${cy}"   r="2.2" fill="${color}" />
  `;

  svg.innerHTML = `
    <!-- Cape behind the body — always rendered for hero silhouette. -->
    <g class="cape">
      <path d="M 50 100 Q 30 170 60 218 Q 100 196 140 218 Q 170 170 150 100 Q 100 110 50 100 Z"
            fill="#2378c8" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 60 105 Q 50 160 80 208 Q 100 196 120 208 Q 150 160 140 105 Q 100 115 60 105 Z"
            fill="url(#g-shade)" opacity="0.65" />
      <rect x="84" y="98" width="32" height="6" rx="2" fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" />
      <circle cx="100" cy="101" r="3" fill="#ef3e3e" stroke="#1a1a1a" stroke-width="1" />
    </g>

    <!-- Top tentacle pair (animator's "ear" anchors — idle-twitch). -->
    <g id="left-ear" class="left-ear">
      <path d="M 56 56 Q 48 30 76 26 Q 86 50 76 64 Z" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 56 56 Q 48 30 76 26 Q 86 50 76 64 Z" fill="url(#g-shade)" opacity="0.55" />
      <circle cx="60" cy="44" r="1.6" fill="${tone.shade}" />
      <circle cx="68" cy="36" r="1.6" fill="${tone.shade}" />
    </g>
    <g id="right-ear" class="right-ear">
      <path d="M 144 56 Q 152 30 124 26 Q 114 50 124 64 Z" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 144 56 Q 152 30 124 26 Q 114 50 124 64 Z" fill="url(#g-shade)" opacity="0.55" />
      <circle cx="140" cy="44" r="1.6" fill="${tone.shade}" />
      <circle cx="132" cy="36" r="1.6" fill="${tone.shade}" />
    </g>

    <!-- Lower tentacles (animator's "leg" anchors). Two thick curling
         tentacles spreading outward from the bottom of the mantle. -->
    <g id="left-leg" class="left-leg">
      <path d="M 76 198 Q 50 214 30 196 Q 36 188 56 188 Q 70 188 76 198 Z" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      ${cups(50, 200, tone.shade)}
    </g>
    <g id="right-leg" class="right-leg">
      <path d="M 124 198 Q 150 214 170 196 Q 164 188 144 188 Q 130 188 124 198 Z" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      ${cups(150, 200, tone.shade)}
    </g>

    <!-- Body / mantle — round bulb with painterly shading. -->
    <g id="body" class="body">
      <ellipse cx="100" cy="160" rx="58" ry="48" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2.5" />
      <ellipse cx="100" cy="160" rx="58" ry="48" fill="url(#g-shade)" />
      <ellipse cx="84"  cy="138" rx="36" ry="20" fill="url(#g-highlight)" />
      <ellipse id="belly" class="belly" cx="100" cy="172" rx="42" ry="32" fill="${tone.belly}" />
      <ellipse cx="100" cy="172" rx="42" ry="32" fill="url(#g-shade)" opacity="0.5" />
      <ellipse cx="86"  cy="156" rx="22" ry="12" fill="url(#g-highlight)" opacity="0.7" />
      <!-- Hero emblem on chest: trident -->
      <g class="hero-emblem">
        <line x1="100" y1="148" x2="100" y2="180" stroke="#ffd23f" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 88 156 L 88 148 M 100 156 L 100 144 M 112 156 L 112 148 M 88 156 L 112 156"
              stroke="#ffd23f" stroke-width="2.5" stroke-linecap="round" fill="none" />
      </g>
    </g>

    <!-- Side raised tentacles (animator's "arm" anchors). Curling up
         to suggest hero pose. -->
    <g id="left-arm" class="left-arm">
      <path d="M 50 156 Q 22 138 26 102 Q 44 116 56 142 Z" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 50 156 Q 22 138 26 102 Q 44 116 56 142 Z" fill="url(#g-shade)" opacity="0.5" />
      ${cups(40, 132, tone.shade)}
    </g>
    <g id="right-arm" class="right-arm">
      <path d="M 150 156 Q 178 138 174 102 Q 156 116 144 142 Z" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 150 156 Q 178 138 174 102 Q 156 116 144 142 Z" fill="url(#g-shade)" opacity="0.5" />
      ${cups(160, 132, tone.shade)}
    </g>

    ${accessory === 'bamboo' ? `
      <!-- Sea-power scepter (legacy id "bamboo"). -->
      <g class="accessory bamboo-stalk">
        <rect x="96" y="120" width="8" height="80" rx="3" fill="#7a4a2a" stroke="#1a1a1a" stroke-width="1" />
        <path d="M 92 122 L 100 102 L 108 122 Z" fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round" />
        <circle cx="100" cy="115" r="3" fill="#ef3e3e" stroke="#1a1a1a" stroke-width="1" />
      </g>
    ` : ''}

    <!-- Head / mantle top — same circle as body but with the face. -->
    <g id="head" class="head">
      <circle cx="100" cy="100" r="60" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2.5" />
      <circle cx="100" cy="100" r="60" fill="url(#g-shade)" />
      <ellipse cx="80"  cy="76"  rx="36" ry="20" fill="url(#g-highlight)" />

      <!-- Default hero mask wrapped around the eyes. -->
      <path d="M 50 96 Q 56 84 76 84 L 124 84 Q 144 84 150 96 Q 134 106 100 106 Q 66 106 50 96 Z"
            fill="#1a1a1a" stroke="#000" stroke-width="1" />

      <!-- Eye whites (sit on top of the mask). -->
      <ellipse class="eye-white" cx="78"  cy="98" rx="9" ry="11" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.5" />
      <ellipse class="eye-white" cx="122" cy="98" rx="9" ry="11" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.5" />

      <!-- Pupils -->
      <g id="left-eye"  class="left-eye"><circle class="pupil" cx="78"  cy="100" r="4" fill="#1a1a1a" /></g>
      <g id="right-eye" class="right-eye"><circle class="pupil" cx="122" cy="100" r="4" fill="#1a1a1a" /></g>

      <!-- Eyelids -->
      <g id="left-eyelid"  class="left-eyelid"><ellipse cx="78"  cy="98" rx="9" ry="11" fill="${tone.skin}" /></g>
      <g id="right-eyelid" class="right-eyelid"><ellipse cx="122" cy="98" rx="9" ry="11" fill="${tone.skin}" /></g>

      <!-- Cheeks -->
      <g id="left-cheek"  class="left-cheek"><circle cx="60"  cy="118" r="7" fill="var(--c-cheek)" opacity="0.6" /></g>
      <g id="right-cheek" class="right-cheek"><circle cx="140" cy="118" r="7" fill="var(--c-cheek)" opacity="0.6" /></g>

      <!-- Beak / mouth area: small pointed beak -->
      <g id="nose" class="nose">
        <path d="M 96 122 L 100 116 L 104 122 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="1" />
      </g>

      <!-- Mouth — confident smirk. -->
      <g id="mouth" class="mouth">
        <path class="mouth-closed" d="M 88 138 Q 100 146 112 138" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
        <path class="mouth-open"   d="M 88 138 Q 100 154 112 138 Q 100 146 88 138 Z" fill="#7a2828" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
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
          <circle cx="78"  cy="100" r="11" fill="rgba(127,198,255,0.35)" stroke="#1a1a1a" stroke-width="3" />
          <circle cx="122" cy="100" r="11" fill="rgba(127,198,255,0.35)" stroke="#1a1a1a" stroke-width="3" />
          <line x1="89" y1="100" x2="111" y2="100" stroke="#1a1a1a" stroke-width="3" />
        </g>
      ` : ''}
      ${accessory === 'scarf' ? `
        <!-- Power belt (legacy id "scarf"). -->
        <g class="accessory scarf">
          <rect x="56" y="186" width="88" height="10" fill="#1a1a1a" />
          <rect x="92" y="184" width="16" height="14" rx="2" fill="#3aa6ff" stroke="#1a1a1a" stroke-width="1.5" />
        </g>
      ` : ''}
      ${accessory === 'flower' ? `
        <g class="accessory flower">
          <path d="M 60 56 L 64 46 L 68 56 L 78 58 L 70 64 L 72 74 L 64 68 L 56 74 L 58 64 L 50 58 Z" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round" />
          <circle cx="64" cy="60" r="2" fill="#ffd23f" />
        </g>
      ` : ''}
    </g>
  `;

  return svg;
}
