// Shark Hero (formerly the koala builder).
//
// Sea-hero reskin — for backward compatibility with tests, scene art,
// and persisted buddy state, the file/function/species id stays
// "koala". Visually it now renders a streamlined shark hero with a
// dorsal fin headpiece, side pectoral fins (animated as arms), tail
// flukes (animated as legs), and a heroic underbelly highlight. The
// painterly gradient overlays from svgFilters.js (g-highlight + g-shade)
// give it a 3D-ish shaded look.
//
// The animator targets these classes for blink / look-at-cursor / wave
// / cheer / talk-sync, so the ear/arm/leg/eye/mouth IDs are preserved
// as anchor points even though they correspond to fins on a shark.
//
// Returns an <svg> element whose direct children are named groups
// (#body, #head, #left-ear, #right-ear, #left-eye, #right-eye,
//  #left-eyelid, #right-eyelid, #left-cheek, #right-cheek, #nose,
//  #mouth, #left-arm, #right-arm, #left-leg, #right-leg, #belly).

const SVG_NS = 'http://www.w3.org/2000/svg';

// Hero color schemes. Variant names kept for buddy-storage compat
// (classic / warm / blue) — the colors are now ocean-hero palettes.
const SHARK_TONES = {
  // Default: deep-sea blue hero.
  classic: { skin: '#3a7ec0', shade: '#22568f', belly: '#dfeefb' },
  // Warm = lava shark (red/orange hero).
  warm:    { skin: '#d2563a', shade: '#9c3a26', belly: '#ffe4d6' },
  // Blue = ice shark (cyan/teal hero).
  blue:    { skin: '#4cc8d2', shade: '#2a8a93', belly: '#dffaff' },
};

export function buildKoala({ variant = 'classic', size = 'medium', accessory = null } = {}) {
  const tone = SHARK_TONES[variant] || SHARK_TONES.classic;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 220');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('class', `character koala size-${size} variant-${variant}`);
  svg.dataset.species = 'koala';
  svg.dataset.variant = variant;

  svg.innerHTML = `
    <!-- Cape behind the body — always rendered for the hero silhouette.
         Color scales with the variant. -->
    <g class="cape">
      <path d="M 50 90 Q 30 160 60 210 Q 100 188 140 210 Q 170 160 150 90 Q 100 100 50 90 Z"
            fill="#c8242a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 60 95 Q 50 150 80 200 Q 100 188 120 200 Q 150 150 140 95 Q 100 105 60 95 Z"
            fill="url(#g-shade)" opacity="0.65" />
      <!-- Cape collar / clasp -->
      <rect x="84" y="88" width="32" height="6" rx="2" fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" />
      <circle cx="100" cy="91" r="3" fill="#ef3e3e" stroke="#1a1a1a" stroke-width="1" />
    </g>

    <!-- Top fins (the "ears" anchor points so animator's idle-ear-twitch
         applies). These read as a dorsal-fin crest on top of the head. -->
    <g id="left-ear" class="left-ear">
      <path d="M 56 56 L 76 18 L 86 60 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 60 56 L 76 26 L 80 56 Z" fill="${tone.skin}" />
    </g>
    <g id="right-ear" class="right-ear">
      <path d="M 144 56 L 124 18 L 114 60 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 140 56 L 124 26 L 120 56 Z" fill="${tone.skin}" />
    </g>

    <!-- Tail flukes (animator's left-leg / right-leg anchors). Visually
         these are the shark tail spread wide at the bottom. -->
    <g id="left-leg" class="left-leg">
      <path d="M 60 196 L 32 214 L 68 208 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
    </g>
    <g id="right-leg" class="right-leg">
      <path d="M 140 196 L 168 214 L 132 208 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
    </g>

    <!-- Body — torpedo-shaped trunk with painterly highlight + shade -->
    <g id="body" class="body">
      <ellipse cx="100" cy="160" rx="58" ry="48" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2.5" />
      <ellipse cx="100" cy="160" rx="58" ry="48" fill="url(#g-shade)" />
      <ellipse cx="84"  cy="138" rx="36" ry="20" fill="url(#g-highlight)" />
      <!-- Lighter underbelly disc -->
      <ellipse id="belly" class="belly" cx="100" cy="172" rx="42" ry="32" fill="${tone.belly}" />
      <ellipse cx="100" cy="172" rx="42" ry="32" fill="url(#g-shade)" opacity="0.5" />
      <ellipse cx="86"  cy="156" rx="22" ry="12" fill="url(#g-highlight)" opacity="0.7" />
      <!-- Hero emblem on chest: lightning bolt -->
      <path d="M 96 152 L 108 152 L 102 162 L 110 162 L 96 180 L 100 168 L 92 168 Z"
            fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round" />
      <!-- Gill slits along the side -->
      <path d="M 56 158 q 4 -3 8 0" stroke="#1a1a1a" stroke-width="1.2" fill="none" />
      <path d="M 56 168 q 4 -3 8 0" stroke="#1a1a1a" stroke-width="1.2" fill="none" />
      <path d="M 56 178 q 4 -3 8 0" stroke="#1a1a1a" stroke-width="1.2" fill="none" />
    </g>

    <!-- Side fins (animator's left-arm / right-arm anchors). -->
    <g id="left-arm" class="left-arm">
      <path d="M 50 152 Q 22 168 30 196 Q 48 184 56 168 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 48 156 Q 32 172 36 188 Q 48 178 54 168 Z" fill="${tone.skin}" />
    </g>
    <g id="right-arm" class="right-arm">
      <path d="M 150 152 Q 178 168 170 196 Q 152 184 144 168 Z" fill="${tone.shade}" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
      <path d="M 152 156 Q 168 172 164 188 Q 152 178 146 168 Z" fill="${tone.skin}" />
    </g>

    <!-- Head -->
    <g id="head" class="head">
      <ellipse cx="100" cy="100" rx="60" ry="54" fill="${tone.skin}" stroke="#1a1a1a" stroke-width="2.5" />
      <ellipse cx="100" cy="100" rx="60" ry="54" fill="url(#g-shade)" />
      <ellipse cx="80"  cy="76"  rx="36" ry="20" fill="url(#g-highlight)" />

      <!-- Eye whites -->
      <ellipse class="eye-white" cx="78"  cy="98" rx="11" ry="13" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.5" />
      <ellipse class="eye-white" cx="122" cy="98" rx="11" ry="13" fill="#ffffff" stroke="#1a1a1a" stroke-width="1.5" />

      <!-- Pupils -->
      <g id="left-eye"  class="left-eye"><circle class="pupil" cx="78"  cy="100" r="5" fill="#1a1a1a" /></g>
      <g id="right-eye" class="right-eye"><circle class="pupil" cx="122" cy="100" r="5" fill="#1a1a1a" /></g>

      <!-- Eyelids — collapsed by default, animator scales for blink -->
      <g id="left-eyelid"  class="left-eyelid"><ellipse cx="78"  cy="98" rx="11" ry="13" fill="${tone.skin}" /></g>
      <g id="right-eyelid" class="right-eyelid"><ellipse cx="122" cy="98" rx="11" ry="13" fill="${tone.skin}" /></g>

      <!-- Cheeks — heroic blush -->
      <g id="left-cheek"  class="left-cheek"><circle cx="68"  cy="118" r="7" fill="var(--c-cheek)" opacity="0.55" /></g>
      <g id="right-cheek" class="right-cheek"><circle cx="132" cy="118" r="7" fill="var(--c-cheek)" opacity="0.55" /></g>

      <!-- Nose / snout tip with two nostril dots -->
      <g id="nose" class="nose">
        <ellipse cx="100" cy="118" rx="14" ry="8" fill="${tone.shade}" />
        <circle cx="94"  cy="118" r="1.5" fill="#1a1a1a" />
        <circle cx="106" cy="118" r="1.5" fill="#1a1a1a" />
      </g>

      <!-- Mouth — confident closed smile + open mouth with sharp teeth -->
      <g id="mouth" class="mouth">
        <path class="mouth-closed" d="M 84 138 Q 100 148 116 138" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
        <g class="mouth-open">
          <path d="M 84 138 Q 100 156 116 138 Q 100 148 84 138 Z" fill="#7a2828" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
          <!-- triangular teeth row -->
          <path d="M 86 140 l 4 6 l 4 -6 l 4 6 l 4 -6 l 4 6 l 4 -6 l 4 6 l 4 -6 z" fill="#ffffff" stroke="#1a1a1a" stroke-width="0.8" />
        </g>
      </g>

      ${accessory === 'leaf' ? `
        <!-- Sidekick badge: a glowing fin emblem. (legacy id "leaf") -->
        <g class="accessory leaf">
          <path d="M 64 50 L 100 30 L 136 50 L 100 60 Z" fill="#ffd23f" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" />
          <circle cx="100" cy="46" r="4" fill="#ef3e3e" stroke="#1a1a1a" stroke-width="1.5" />
        </g>
      ` : ''}
      ${accessory === 'hat' ? `
        <!-- Domino mask. (legacy id "hat") -->
        <g class="accessory hat">
          <path d="M 56 88 Q 60 78 76 78 L 124 78 Q 140 78 144 88 Q 130 96 100 96 Q 70 96 56 88 Z"
                fill="#1a1a1a" stroke="#000" stroke-width="1.5" />
          <ellipse cx="78"  cy="88" rx="8" ry="5" fill="#ffd23f" />
          <ellipse cx="122" cy="88" rx="8" ry="5" fill="#ffd23f" />
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
        <!-- Scuba goggles. -->
        <g class="accessory glasses">
          <circle cx="78"  cy="100" r="14" fill="rgba(127,198,255,0.35)" stroke="#1a1a1a" stroke-width="3" />
          <circle cx="122" cy="100" r="14" fill="rgba(127,198,255,0.35)" stroke="#1a1a1a" stroke-width="3" />
          <line x1="92" y1="100" x2="108" y2="100" stroke="#1a1a1a" stroke-width="3" />
          <path d="M 64 100 Q 50 100 50 110" stroke="#1a1a1a" stroke-width="3" fill="none" />
          <path d="M 136 100 Q 150 100 150 110" stroke="#1a1a1a" stroke-width="3" fill="none" />
        </g>
      ` : ''}
      ${accessory === 'scarf' ? `
        <!-- Hero utility belt + sash. (legacy id "scarf") -->
        <g class="accessory scarf">
          <rect x="56" y="186" width="88" height="10" fill="#1a1a1a" />
          <rect x="92" y="184" width="16" height="14" rx="2" fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" />
        </g>
      ` : ''}
      ${accessory === 'flower' ? `
        <!-- Starfish badge. (legacy id "flower") -->
        <g class="accessory flower">
          <path d="M 60 56 L 64 46 L 68 56 L 78 58 L 70 64 L 72 74 L 64 68 L 56 74 L 58 64 L 50 58 Z" fill="#ff8a3d" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round" />
          <circle cx="64" cy="60" r="2" fill="#ffd23f" />
        </g>
      ` : ''}
    </g>
  `;

  return svg;
}
