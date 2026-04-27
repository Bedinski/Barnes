// Illustrated hotspot icons (Polish iteration 2). Each builder returns
// an SVG <g> element designed to sit inside a 128×128 user-unit box
// centered on (0, 0). They replace the flat emoji glyphs the world-map
// hub used to render — turning each "place" into a tiny illustrated
// scene that reads as part of the world rather than a generic icon.
//
// The drawings are intentionally chunky and crayon-bright so they read
// well at the size the bubble allows on a phone (~60–80px square).

const SVG_NS = 'http://www.w3.org/2000/svg';

function group(attrs = {}) {
  const g = document.createElementNS(SVG_NS, 'g');
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) g.setAttribute(k, String(v));
  }
  return g;
}

// Each builder writes its inner SVG via innerHTML for compactness — the
// markup is inert content, no runtime templating, and the existing
// character builders use the same pattern.

function libraryTreehouse() {
  const g = group({ class: 'hot-icon hot-treehouse' });
  g.innerHTML = `
    <!-- canopy: 3 overlapping leafy clouds -->
    <ellipse cx="-18" cy="-22" rx="22" ry="18" fill="#3f8b3a" />
    <ellipse cx="14"  cy="-28" rx="24" ry="20" fill="#4ea14a" />
    <ellipse cx="0"   cy="-12" rx="30" ry="20" fill="#54c45e" />
    <ellipse cx="-10" cy="-22" rx="10" ry="6"  fill="#8be094" opacity="0.6" />
    <!-- trunk -->
    <rect x="-7" y="-2" width="14" height="32" rx="3" fill="#7a4a2a" />
    <rect x="-7" y="-2" width="14" height="32" rx="3" fill="url(#g-shade)" />
    <!-- tiny door -->
    <rect x="-5" y="6" width="10" height="14" rx="3" fill="#3a2515" />
    <circle cx="3" cy="14" r="1" fill="#ffd23f" />
    <!-- a book on a branch -->
    <rect x="10" y="-4" width="12" height="9" rx="1" fill="#ef3e3e" />
    <rect x="10" y="-4" width="12" height="2" fill="#a52323" />
  `;
  return g;
}

function phonicsCave() {
  const g = group({ class: 'hot-icon hot-cave' });
  g.innerHTML = `
    <!-- ground shadow -->
    <ellipse cx="0" cy="28" rx="34" ry="6" fill="rgba(0,0,0,0.18)" />
    <!-- cave arch -->
    <path d="M -32 28 L -32 0 Q -32 -28 0 -28 Q 32 -28 32 0 L 32 28 Z" fill="#1a3a5e" />
    <path d="M -26 26 L -26 2  Q -26 -22 0 -22 Q 26 -22 26 2  L 26 26 Z" fill="#0d2238" />
    <!-- glowing letters spilling out -->
    <text x="-12" y="14" font-family="'Bubblegum Sans', sans-serif" font-size="20" font-weight="700" fill="#ffd23f">A</text>
    <text x="2"   y="20" font-family="'Bubblegum Sans', sans-serif" font-size="16" font-weight="700" fill="#ff8a3d">B</text>
    <text x="14"  y="14" font-family="'Bubblegum Sans', sans-serif" font-size="18" font-weight="700" fill="#54c45e">C</text>
    <!-- two stalactites -->
    <path d="M -18 -22 L -14 -10 L -22 -10 Z" fill="#2a4a6e" />
    <path d="M  16 -22 L  20 -10 L  12 -10 Z" fill="#2a4a6e" />
  `;
  return g;
}

function clozePond() {
  const g = group({ class: 'hot-icon hot-pond' });
  g.innerHTML = `
    <!-- water -->
    <ellipse cx="0" cy="14" rx="38" ry="14" fill="#2378c8" />
    <ellipse cx="0" cy="14" rx="38" ry="14" fill="url(#g-shade)" opacity="0.6" />
    <ellipse cx="-8" cy="10" rx="14" ry="3" fill="#7fc6ff" opacity="0.7" />
    <!-- two lily pads -->
    <path d="M -20 12 a 10 5 0 1 0 20 0 a 10 5 0 1 0 -20 0 Z M -10 12 L -10 7 Z" fill="#4ea14a" />
    <ellipse cx="14" cy="14" rx="9" ry="4" fill="#54c45e" />
    <!-- thought bubble rising -->
    <circle cx="-6" cy="-4"  r="4" fill="#fff" stroke="#1a1a1a" stroke-width="1.5" />
    <circle cx="2"  cy="-12" r="6" fill="#fff" stroke="#1a1a1a" stroke-width="1.5" />
    <circle cx="14" cy="-22" r="9" fill="#fff" stroke="#1a1a1a" stroke-width="2" />
    <text x="14" y="-19" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="14" font-weight="700" fill="#a672ff">?</text>
  `;
  return g;
}

function matchMeadow() {
  const g = group({ class: 'hot-icon hot-meadow' });
  g.innerHTML = `
    <!-- meadow mound -->
    <ellipse cx="0" cy="22" rx="38" ry="10" fill="#3f8b3a" />
    <ellipse cx="0" cy="20" rx="36" ry="8"  fill="#54c45e" />
    <!-- easel with picture -->
    <line x1="-8" y1="20" x2="-14" y2="-6" stroke="#7a4a2a" stroke-width="3" stroke-linecap="round" />
    <line x1="8"  y1="20" x2="14"  y2="-6" stroke="#7a4a2a" stroke-width="3" stroke-linecap="round" />
    <line x1="-12" y1="6" x2="12"  y2="6"  stroke="#7a4a2a" stroke-width="2" />
    <rect x="-12" y="-18" width="24" height="20" rx="2" fill="#fff8e7" stroke="#1a1a1a" stroke-width="1.5" />
    <!-- abstract picture content -->
    <rect x="-10" y="-15" width="20" height="6" fill="#3aa6ff" />
    <circle cx="-3" cy="-4" r="2" fill="#ffd23f" />
    <!-- flowers around -->
    <circle cx="-26" cy="14" r="3" fill="#ef3e3e" /><circle cx="-26" cy="14" r="1" fill="#ffd23f" />
    <circle cx="26"  cy="14" r="3" fill="#a672ff" /><circle cx="26"  cy="14" r="1" fill="#ffd23f" />
  `;
  return g;
}

function sentenceWorkshop() {
  const g = group({ class: 'hot-icon hot-workshop' });
  g.innerHTML = `
    <!-- back wall plank -->
    <rect x="-32" y="-22" width="64" height="44" rx="4" fill="#a05a3a" />
    <rect x="-32" y="-22" width="64" height="44" rx="4" fill="url(#g-shade)" opacity="0.55" />
    <!-- letter blocks -->
    <rect x="-22" y="-2" width="16" height="16" rx="2" fill="#ef3e3e" stroke="#1a1a1a" stroke-width="1.5" />
    <rect x="-4"  y="-2" width="16" height="16" rx="2" fill="#3aa6ff" stroke="#1a1a1a" stroke-width="1.5" />
    <rect x="14"  y="-2" width="16" height="16" rx="2" fill="#ffd23f" stroke="#1a1a1a" stroke-width="1.5" />
    <!-- block letters -->
    <text x="-14" y="11" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="16" font-weight="700" fill="#fff">C</text>
    <text x="4"   y="11" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="16" font-weight="700" fill="#fff">A</text>
    <text x="22"  y="11" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="16" font-weight="700" fill="#1a1a1a">T</text>
    <!-- topper block -->
    <rect x="-4" y="-22" width="16" height="16" rx="2" fill="#54c45e" stroke="#1a1a1a" stroke-width="1.5" />
    <text x="4"  y="-9" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="16" font-weight="700" fill="#fff">!</text>
  `;
  return g;
}

function stickerGarden() {
  const g = group({ class: 'hot-icon hot-stickers' });
  g.innerHTML = `
    <!-- bouquet stems -->
    <path d="M -6 24 Q -10 4 -16 -10" stroke="#3f8b3a" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M  0 26 Q  0 6  0 -16"   stroke="#3f8b3a" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M  6 24 Q 10 4 16 -10"   stroke="#3f8b3a" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <!-- flowers — 5-petal stars -->
    ${flower(-16, -14, '#ef3e3e')}
    ${flower(  0, -22, '#a672ff')}
    ${flower( 16, -14, '#3aa6ff')}
    <!-- a star sticker peeking in -->
    <path d="M -22 8 l 4 8 l 8 1 l -6 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -6 -6 l 8 -1 z" fill="#ffd23f" stroke="#a07b00" stroke-width="1" transform="scale(0.7) translate(-4 6)" />
    <!-- ribbon at the base -->
    <path d="M -10 22 Q 0 30 10 22 Q 6 26 0 26 Q -6 26 -10 22 Z" fill="#ff77b1" />
  `;
  return g;
}
function flower(x, y, color) {
  return `
    <g transform="translate(${x} ${y})">
      <circle cx="0" cy="-6" r="5" fill="${color}" />
      <circle cx="6" cy="-2" r="5" fill="${color}" />
      <circle cx="-6" cy="-2" r="5" fill="${color}" />
      <circle cx="3" cy="6" r="5" fill="${color}" />
      <circle cx="-3" cy="6" r="5" fill="${color}" />
      <circle cx="0" cy="0" r="3" fill="#ffd23f" />
    </g>
  `;
}

function closetWardrobe() {
  const g = group({ class: 'hot-icon hot-closet' });
  g.innerHTML = `
    <!-- wardrobe body -->
    <rect x="-26" y="-30" width="52" height="58" rx="3" fill="#7a4a2a" stroke="#1a1a1a" stroke-width="2" />
    <rect x="-26" y="-30" width="52" height="58" rx="3" fill="url(#g-shade)" opacity="0.4" />
    <!-- two doors -->
    <rect x="-24" y="-28" width="22" height="54" rx="2" fill="#a05a3a" stroke="#1a1a1a" stroke-width="1.5" />
    <rect x="2"   y="-28" width="22" height="54" rx="2" fill="#a05a3a" stroke="#1a1a1a" stroke-width="1.5" />
    <!-- knobs -->
    <circle cx="-6" cy="0" r="2" fill="#ffd23f" />
    <circle cx="6"  cy="0" r="2" fill="#ffd23f" />
    <!-- bow on top -->
    <circle cx="0" cy="-30" r="4" fill="#ef3e3e" />
    <path d="M -10 -30 L 0 -30 L -4 -38 Z" fill="#ef3e3e" />
    <path d="M 10 -30 L 0 -30 L 4 -38 Z" fill="#ef3e3e" />
    <!-- legs -->
    <rect x="-22" y="28" width="6" height="4" fill="#1a1a1a" />
    <rect x="16"  y="28" width="6" height="4" fill="#1a1a1a" />
  `;
  return g;
}

const REGISTRY = {
  library:       libraryTreehouse,
  phonics:       phonicsCave,
  cloze:         clozePond,
  wordPicture:   matchMeadow,
  buildSentence: sentenceWorkshop,
  stickerBook:   stickerGarden,
  closet:        closetWardrobe,
};

export function buildHotspotIcon(id) {
  const fn = REGISTRY[id];
  return fn ? fn() : null;
}
