// Octopus Hero (formerly the panda builder).
//
// Sea-hero reskin (v2 — make octopus visually unambiguous). The
// previous design shared too much silhouette with the shark (cape +
// mask + round body). This iteration drops the cape, makes the mantle
// a tall purple bulb, and spreads SIX visible tentacles outward with
// clear suction cups so a 7-year-old reads it instantly as "octopus."
//
// For backward compatibility with tests, scene art, and persisted
// buddy state, the file/function/species id stays "panda".
//
// The animator targets these classes for blink / look-at-cursor / wave
// / cheer / talk-sync, so the ear/arm/leg/eye/mouth IDs are preserved
// as anchor points even though they correspond to tentacles. Eight
// visible tentacles total: two top (ears), two side (arms), two
// bottom (legs), plus two extra decorative ones not tied to animator.

const SVG_NS = 'http://www.w3.org/2000/svg';

const OCTO_TONES = {
  // Default: violet octopus hero.
  classic: { skin: '#a672ff', shade: '#6a3fc4', light: '#c89bff', belly: '#ecdcff' },
  // Pinky variant.
  pinky:   { skin: '#ff77b1', shade: '#c4477f', light: '#ffa9cf', belly: '#ffe4ee' },
};

export function buildPanda({ variant = 'classic', size = 'medium', accessory = null } = {}) {
  const tone = OCTO_TONES[variant] || OCTO_TONES.classic;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 220');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', `character panda size-${size} variant-${variant}`);
  svg.dataset.species = 'panda';
  svg.dataset.variant = variant;

  // Suction cup row — small darker dots along a tentacle.
  const cups = (path) => path; // placeholder — cups are inlined per-tentacle below.
  void cups;

  svg.innerHTML = `
    <!-- TWO EXTRA decorative tentacles (no animator anchor) — sit
         BEHIND the body so the silhouette has eight tentacle bases
         total, unambiguously reading as "octopus". -->
    <g class="extra-tentacles" aria-hidden="true">
      <!-- back-left tentacle -->
      <path d="M 70 180 Q 30 196 12 156 Q 26 158 38 174 Q 52 184 70 180 Z"
            fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <circle cx="22" cy="166" r="2.2" fill="${tone.belly}" />
      <circle cx="32" cy="174" r="2.2" fill="${tone.belly}" />
      <!-- back-right tentacle -->
      <path d="M 130 180 Q 170 196 188 156 Q 174 158 162 174 Q 148 184 130 180 Z"
            fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <circle cx="178" cy="166" r="2.2" fill="${tone.belly}" />
      <circle cx="168" cy="174" r="2.2" fill="${tone.belly}" />
    </g>

    <!-- TOP tentacles (animator anchors: left-ear / right-ear).
         Curling upward like stalk-eyes / sensory tentacles. -->
    <g id="left-ear" class="left-ear">
      <path d="M 76 56 Q 60 28 68 8 Q 86 18 88 50 Z"
            fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 76 56 Q 60 28 68 8 Q 86 18 88 50 Z" fill="url(#g-shade)" opacity="0.45" />
      <circle cx="73" cy="40" r="1.8" fill="${tone.belly}" />
      <circle cx="76" cy="28" r="1.8" fill="${tone.belly}" />
      <circle cx="80" cy="16" r="1.8" fill="${tone.belly}" />
    </g>
    <g id="right-ear" class="right-ear">
      <path d="M 124 56 Q 140 28 132 8 Q 114 18 112 50 Z"
            fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 124 56 Q 140 28 132 8 Q 114 18 112 50 Z" fill="url(#g-shade)" opacity="0.45" />
      <circle cx="127" cy="40" r="1.8" fill="${tone.belly}" />
      <circle cx="124" cy="28" r="1.8" fill="${tone.belly}" />
      <circle cx="120" cy="16" r="1.8" fill="${tone.belly}" />
    </g>

    <!-- BOTTOM tentacles (animator anchors: left-leg / right-leg).
         Curling forward and out. -->
    <g id="left-leg" class="left-leg">
      <path d="M 76 196 Q 50 220 30 200 Q 36 188 56 188 Q 70 188 76 198 Z"
            fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <circle cx="60" cy="202" r="2.2" fill="${tone.belly}" />
      <circle cx="50" cy="206" r="2.2" fill="${tone.belly}" />
      <circle cx="40" cy="206" r="2.2" fill="${tone.belly}" />
    </g>
    <g id="right-leg" class="right-leg">
      <path d="M 124 196 Q 150 220 170 200 Q 164 188 144 188 Q 130 188 124 198 Z"
            fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <circle cx="140" cy="202" r="2.2" fill="${tone.belly}" />
      <circle cx="150" cy="206" r="2.2" fill="${tone.belly}" />
      <circle cx="160" cy="206" r="2.2" fill="${tone.belly}" />
    </g>

    <!-- BODY / mantle — tall round purple bulb. The body and head are
         visually one unified mantle so the character reads as octopus,
         but the animator still gets distinct .body and .head groups. -->
    <g id="body" class="body">
      <ellipse cx="100" cy="160" rx="56" ry="44" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2.5" />
      <ellipse cx="100" cy="160" rx="56" ry="44" fill="url(#g-shade)" />
      <ellipse cx="84"  cy="138" rx="34" ry="18" fill="url(#g-highlight)" />
      <!-- Soft underside spots for octopus pattern -->
      <circle cx="78"  cy="170" r="3" fill="${tone.shade}" opacity="0.5" />
      <circle cx="100" cy="180" r="3" fill="${tone.shade}" opacity="0.5" />
      <circle cx="122" cy="170" r="3" fill="${tone.shade}" opacity="0.5" />
      <ellipse id="belly" class="belly" cx="100" cy="172" rx="36" ry="26" fill="${tone.belly}" opacity="0.6" />
    </g>

    <!-- SIDE tentacles (animator anchors: left-arm / right-arm). Big
         curling tentacles that read as the octopus's signature limbs. -->
    <g id="left-arm" class="left-arm">
      <path d="M 50 152 Q 16 130 22 80 Q 38 100 48 130 Q 56 142 60 150 Z"
            fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 50 152 Q 16 130 22 80 Q 38 100 48 130 Q 56 142 60 150 Z" fill="url(#g-shade)" opacity="0.5" />
      <circle cx="40" cy="138" r="2.2" fill="${tone.belly}" />
      <circle cx="32" cy="118" r="2.2" fill="${tone.belly}" />
      <circle cx="26" cy="98"  r="2.2" fill="${tone.belly}" />
    </g>
    <g id="right-arm" class="right-arm">
      <path d="M 150 152 Q 184 130 178 80 Q 162 100 152 130 Q 144 142 140 150 Z"
            fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 150 152 Q 184 130 178 80 Q 162 100 152 130 Q 144 142 140 150 Z" fill="url(#g-shade)" opacity="0.5" />
      <circle cx="160" cy="138" r="2.2" fill="${tone.belly}" />
      <circle cx="168" cy="118" r="2.2" fill="${tone.belly}" />
      <circle cx="174" cy="98"  r="2.2" fill="${tone.belly}" />
    </g>

    ${accessory === 'bamboo' ? `
      <!-- Sea-power scepter (legacy id "bamboo"). -->
      <g class="accessory bamboo-stalk">
        <rect x="96" y="120" width="8" height="80" rx="3" fill="#7a4a2a" stroke="#1a1a1a" stroke-width="1" />
        <path d="M 92 122 L 100 102 L 108 122 Z" fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round" />
        <circle cx="100" cy="115" r="3" fill="#ef3e3e" stroke="#1a1a1a" stroke-width="1" />
      </g>
    ` : ''}

    <!-- HEAD — the upper dome of the mantle. Same purple as the body,
         no visible boundary, so head + body read as one bulb. -->
    <g id="head" class="head">
      <ellipse cx="100" cy="100" rx="60" ry="56" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2.5" />
      <ellipse cx="100" cy="100" rx="60" ry="56" fill="url(#g-shade)" />
      <ellipse cx="80"  cy="76"  rx="36" ry="20" fill="url(#g-highlight)" />

      <!-- Big innocent eyes — no mask. Eyes alone read as "creature
           with face" not "superhero in disguise"; tentacles do all the
           hero-character lifting. -->
      <ellipse class="eye-white" cx="78"  cy="98" rx="13" ry="15" fill="#ffffff" stroke="#1a1a1a" stroke-width="2" />
      <ellipse class="eye-white" cx="122" cy="98" rx="13" ry="15" fill="#ffffff" stroke="#1a1a1a" stroke-width="2" />

      <g id="left-eye"  class="left-eye"><circle class="pupil" cx="78"  cy="100" r="6" fill="#1a1a1a" /></g>
      <g id="right-eye" class="right-eye"><circle class="pupil" cx="122" cy="100" r="6" fill="#1a1a1a" /></g>

      <g id="left-eyelid"  class="left-eyelid"><ellipse cx="78"  cy="98" rx="13" ry="15" fill="${tone.skin}" /></g>
      <g id="right-eyelid" class="right-eyelid"><ellipse cx="122" cy="98" rx="13" ry="15" fill="${tone.skin}" /></g>

      <!-- Eye highlights -->
      <circle cx="74"  cy="95" r="2.5" fill="#ffffff" opacity="0.9" />
      <circle cx="118" cy="95" r="2.5" fill="#ffffff" opacity="0.9" />

      <g id="left-cheek"  class="left-cheek"><circle cx="58"  cy="118" r="7" fill="var(--c-cheek)" opacity="0.6" /></g>
      <g id="right-cheek" class="right-cheek"><circle cx="142" cy="118" r="7" fill="var(--c-cheek)" opacity="0.6" /></g>

      <!-- Octopus beak / pointed mouth area between the tentacles. -->
      <g id="nose" class="nose">
        <path d="M 96 124 L 100 116 L 104 124 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="1" />
      </g>

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
          <circle cx="78"  cy="100" r="13" fill="rgba(127,198,255,0.35)" stroke="#1a1a1a" stroke-width="3" />
          <circle cx="122" cy="100" r="13" fill="rgba(127,198,255,0.35)" stroke="#1a1a1a" stroke-width="3" />
          <line x1="91" y1="100" x2="109" y2="100" stroke="#1a1a1a" stroke-width="3" />
        </g>
      ` : ''}
      ${accessory === 'scarf' ? `
        <!-- Power belt across the mantle. -->
        <g class="accessory scarf">
          <rect x="50" y="156" width="100" height="10" fill="#1a1a1a" />
          <rect x="92" y="154" width="16" height="14" rx="2" fill="#3aa6ff" stroke="#1a1a1a" stroke-width="1.5" />
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
