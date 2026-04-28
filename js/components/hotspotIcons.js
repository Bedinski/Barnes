// Underwater Hero hotspot icons (Sea-Hero reskin).
//
// Each builder returns an SVG <g> element designed to sit inside a
// 128×128 user-unit box centered on (0, 0). They replace the previous
// crayon-forest icons with sea-themed equivalents that fit the new
// 7-year-old superhero adventure tone.
//
//   library     → ancient seaweed library scroll-tower
//   phonics     → glowing sound conch shell
//   cloze       → thinking sea-bubble
//   wordPicture → coral reef twins
//   buildSentence → torpedo letter-block sub
//   stickerBook → pearl + starfish bouquet
//   closet      → hero-gear treasure chest
//
// The drawings are intentionally chunky and contrast-heavy so they
// read at the bubble's typical 60-80px on phones.

const SVG_NS = 'http://www.w3.org/2000/svg';

function group(attrs = {}) {
  const g = document.createElementNS(SVG_NS, 'g');
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) g.setAttribute(k, String(v));
  }
  return g;
}

// Books → an underwater scroll-tower with a beam of light and a fish.
function libraryTower() {
  const g = group({ class: 'hot-icon hot-tower' });
  g.innerHTML = `
    <!-- light beam from above -->
    <path d="M -8 -34 L 8 -34 L 18 28 L -18 28 Z" fill="#ffd23f" opacity="0.35" />
    <!-- tower stack of "scroll books" -->
    <rect x="-22" y="6"  width="44" height="10" rx="2" fill="#1ea0ff" stroke="#061226" stroke-width="2" />
    <rect x="-22" y="6"  width="44" height="3"  fill="#0a78bf" />
    <rect x="-20" y="-6" width="40" height="12" rx="2" fill="#ef2c4a" stroke="#061226" stroke-width="2" />
    <rect x="-20" y="-6" width="40" height="3"  fill="#a51a30" />
    <rect x="-18" y="-22" width="36" height="16" rx="2" fill="#ffd23f" stroke="#061226" stroke-width="2" />
    <rect x="-18" y="-22" width="36" height="3"  fill="#a07b00" />
    <text x="0" y="-10" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="14" font-weight="800" fill="#061226">A B</text>
    <!-- bottom kelp blade peeking up -->
    <path d="M -28 28 q 4 -10 -2 -22" stroke="#1ec4a3" stroke-width="3" fill="none" stroke-linecap="round" />
    <!-- tiny fish swimming by -->
    <g transform="translate(22 -20)">
      <ellipse cx="0" cy="0" rx="6" ry="3" fill="#ff7a1a" />
      <path d="M 6 0 l 4 -3 l 0 6 z" fill="#ff7a1a" />
      <circle cx="-2" cy="-1" r="0.8" fill="#061226" />
    </g>
  `;
  return g;
}

// Sounds → a glowing conch shell with letters spilling out.
function phonicsConch() {
  const g = group({ class: 'hot-icon hot-conch' });
  g.innerHTML = `
    <!-- glow halo behind shell -->
    <ellipse cx="0" cy="6" rx="32" ry="22" fill="#ffd23f" opacity="0.25" />
    <!-- conch body -->
    <path d="M -28 14 Q -32 -14 -2 -22 Q 30 -16 28 14 Q 0 26 -28 14 Z"
          fill="#ffd9b5" stroke="#061226" stroke-width="2.5" stroke-linejoin="round" />
    <!-- spiral lines -->
    <path d="M -24 12 Q -10 -16 22 -8" stroke="#c4885c" stroke-width="2" fill="none" />
    <path d="M -16 14 Q -2 -8 18 0"   stroke="#c4885c" stroke-width="1.5" fill="none" />
    <path d="M -8 14 Q 4 0 14 6"      stroke="#c4885c" stroke-width="1" fill="none" />
    <!-- inner mouth -->
    <ellipse cx="-14" cy="6" rx="6" ry="10" fill="#ef5d8a" stroke="#061226" stroke-width="2" />
    <!-- letters floating out -->
    <text x="-22" y="-26" font-family="'Bubblegum Sans', sans-serif" font-size="14" font-weight="800" fill="#ffd23f" stroke="#061226" stroke-width="0.5">A</text>
    <text x="-4"  y="-30" font-family="'Bubblegum Sans', sans-serif" font-size="12" font-weight="800" fill="#1ec4a3" stroke="#061226" stroke-width="0.5">B</text>
    <text x="14"  y="-26" font-family="'Bubblegum Sans', sans-serif" font-size="13" font-weight="800" fill="#ff5ca6" stroke="#061226" stroke-width="0.5">C</text>
  `;
  return g;
}

// Fill In → a thought bubble inside a sea-bubble cluster.
function clozeBubble() {
  const g = group({ class: 'hot-icon hot-bubble' });
  g.innerHTML = `
    <!-- sea floor pebbles -->
    <ellipse cx="0" cy="26" rx="34" ry="6" fill="#0a325f" />
    <!-- big thought bubble with question mark -->
    <circle cx="0" cy="-8" r="22" fill="#c8efff" stroke="#061226" stroke-width="2.5" />
    <circle cx="0" cy="-8" r="22" fill="url(#g-shade)" opacity="0.4" />
    <ellipse cx="-8" cy="-16" rx="6" ry="3" fill="#ffffff" opacity="0.7" />
    <text x="0" y="-2" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="28" font-weight="800" fill="#6a40d8">?</text>
    <!-- trailing smaller bubbles -->
    <circle cx="-22" cy="20"  r="6" fill="#c8efff" stroke="#061226" stroke-width="1.5" />
    <circle cx="-12" cy="14"  r="4" fill="#c8efff" stroke="#061226" stroke-width="1.5" />
    <circle cx="-4"  cy="10"  r="2.5" fill="#c8efff" stroke="#061226" stroke-width="1" />
  `;
  return g;
}

// Match → twin coral reef arches with a fish darting through.
function matchReef() {
  const g = group({ class: 'hot-icon hot-reef' });
  g.innerHTML = `
    <!-- sand floor -->
    <ellipse cx="0" cy="26" rx="36" ry="6" fill="#e0c089" />
    <!-- left coral pillar -->
    <path d="M -22 26 Q -24 6 -28 -10 Q -22 -8 -18 -2 Q -22 6 -16 12 Q -20 22 -22 26 Z"
          fill="#ff5ca6" stroke="#061226" stroke-width="2" stroke-linejoin="round" />
    <circle cx="-26" cy="-2" r="3" fill="#ff7a1a" stroke="#061226" stroke-width="1" />
    <!-- right coral pillar -->
    <path d="M 22 26 Q 24 6 28 -10 Q 22 -8 18 -2 Q 22 6 16 12 Q 20 22 22 26 Z"
          fill="#ffd23f" stroke="#061226" stroke-width="2" stroke-linejoin="round" />
    <circle cx="26" cy="0" r="3" fill="#ff5ca6" stroke="#061226" stroke-width="1" />
    <!-- center fish -->
    <g transform="translate(0 4)">
      <ellipse cx="0" cy="0" rx="12" ry="6" fill="#1ea0ff" stroke="#061226" stroke-width="1.5" />
      <path d="M 12 0 l 8 -6 l 0 12 z" fill="#1ea0ff" stroke="#061226" stroke-width="1.5" stroke-linejoin="round" />
      <circle cx="-6" cy="-2" r="1.5" fill="#061226" />
      <path d="M -8 0 q 8 4 16 0" stroke="#0a78bf" stroke-width="1" fill="none" />
    </g>
  `;
  return g;
}

// Build → a torpedo / sub with letter blocks loaded inside.
function sentenceSub() {
  const g = group({ class: 'hot-icon hot-sub' });
  g.innerHTML = `
    <!-- sub body -->
    <ellipse cx="0" cy="0" rx="36" ry="18" fill="#ef2c4a" stroke="#061226" stroke-width="2.5" />
    <ellipse cx="0" cy="0" rx="36" ry="18" fill="url(#g-shade)" opacity="0.45" />
    <ellipse cx="-12" cy="-6" rx="14" ry="6" fill="#ffffff" opacity="0.35" />
    <!-- propeller -->
    <line x1="-36" y1="-8" x2="-44" y2="-12" stroke="#061226" stroke-width="2" stroke-linecap="round" />
    <line x1="-36" y1="8"  x2="-44" y2="12"  stroke="#061226" stroke-width="2" stroke-linecap="round" />
    <circle cx="-36" cy="0" r="3" fill="#ffd23f" stroke="#061226" stroke-width="1.5" />
    <!-- conning tower -->
    <rect x="-6" y="-26" width="14" height="10" rx="2" fill="#ef2c4a" stroke="#061226" stroke-width="2" />
    <rect x="-2" y="-32" width="3" height="8" fill="#061226" />
    <circle cx="-1" cy="-32" r="2" fill="#ffd23f" stroke="#061226" stroke-width="1" />
    <!-- portholes (letters) -->
    <circle cx="-16" cy="0" r="6" fill="#c8efff" stroke="#061226" stroke-width="1.5" />
    <text x="-16" y="3" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="9" font-weight="800" fill="#061226">A</text>
    <circle cx="0"   cy="0" r="6" fill="#c8efff" stroke="#061226" stroke-width="1.5" />
    <text x="0" y="3" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="9" font-weight="800" fill="#061226">B</text>
    <circle cx="16"  cy="0" r="6" fill="#c8efff" stroke="#061226" stroke-width="1.5" />
    <text x="16" y="3" text-anchor="middle" font-family="'Bubblegum Sans', sans-serif" font-size="9" font-weight="800" fill="#061226">C</text>
    <!-- tail bubbles -->
    <circle cx="-44" cy="-2" r="2" fill="#c8efff" stroke="#061226" stroke-width="0.8" />
    <circle cx="-50" cy="4"  r="1.5" fill="#c8efff" stroke="#061226" stroke-width="0.6" />
  `;
  return g;
}

// Stickers → a pearl in an open clam with starfish accents.
function stickersPearl() {
  const g = group({ class: 'hot-icon hot-stickers' });
  g.innerHTML = `
    <!-- light burst -->
    <g stroke="#ffd23f" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
      <line x1="0" y1="-30" x2="0" y2="-22" />
      <line x1="0" y1="22"  x2="0" y2="30" />
      <line x1="-30" y1="0" x2="-22" y2="0" />
      <line x1="22"  y1="0" x2="30"  y2="0" />
      <line x1="-22" y1="-22" x2="-16" y2="-16" />
      <line x1="22"  y1="-22" x2="16"  y2="-16" />
    </g>
    <!-- bottom shell half -->
    <path d="M -28 4 Q -28 24 0 26 Q 28 24 28 4 Q 0 0 -28 4 Z"
          fill="#ff5ca6" stroke="#061226" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M -22 8 q 0 -2 4 -2 M -10 10 q 0 -2 4 -2 M 6 10 q 0 -2 4 -2 M 18 8 q 0 -2 4 -2"
          stroke="#a93a73" stroke-width="1.5" fill="none" />
    <!-- top shell half (open above) -->
    <path d="M -26 4 Q -22 -16 0 -18 Q 22 -16 26 4 Q 0 8 -26 4 Z"
          fill="#ff7a9b" stroke="#061226" stroke-width="2.5" stroke-linejoin="round" />
    <!-- the pearl -->
    <circle cx="0" cy="2" r="9" fill="#fff8e0" stroke="#061226" stroke-width="2" />
    <circle cx="-3" cy="-1" r="3" fill="#ffffff" opacity="0.85" />
    <!-- starfish accent peeking in -->
    <g transform="translate(-26 18) scale(0.55)">
      <path d="M 0 -10 L 3 -3 L 10 -2 L 5 3 L 6 10 L 0 6 L -6 10 L -5 3 L -10 -2 L -3 -3 Z"
            fill="#ff7a1a" stroke="#061226" stroke-width="2" stroke-linejoin="round" />
    </g>
  `;
  return g;
}

// Closet → a treasure chest brimming with hero gear.
function closetChest() {
  const g = group({ class: 'hot-icon hot-chest' });
  g.innerHTML = `
    <!-- chest body -->
    <rect x="-28" y="-2" width="56" height="22" rx="2" fill="#7a4a2a" stroke="#061226" stroke-width="2.5" />
    <rect x="-28" y="-2" width="56" height="22" rx="2" fill="url(#g-shade)" opacity="0.45" />
    <!-- iron bands -->
    <rect x="-28" y="6" width="56" height="3" fill="#404040" />
    <rect x="-3"  y="-2" width="6"  height="22" fill="#404040" />
    <!-- lid (open, behind) -->
    <path d="M -28 -2 Q -28 -22 0 -24 Q 28 -22 28 -2 Z"
          fill="#995a2e" stroke="#061226" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M -26 -3 Q -26 -20 0 -22 Q 26 -20 26 -3 Z" fill="url(#g-shade)" opacity="0.55" />
    <!-- gold spilling out: coins + a gem -->
    <circle cx="-12" cy="-4" r="4" fill="#ffd23f" stroke="#061226" stroke-width="1.5" />
    <circle cx="-2"  cy="-6" r="4" fill="#ffd23f" stroke="#061226" stroke-width="1.5" />
    <circle cx="10"  cy="-4" r="4" fill="#ffd23f" stroke="#061226" stroke-width="1.5" />
    <path d="M 16 -10 L 22 -6 L 18 0 L 14 0 L 10 -6 Z"
          fill="#ef2c4a" stroke="#061226" stroke-width="1.5" stroke-linejoin="round" />
    <!-- mask peeking out (hero gear) -->
    <path d="M -22 -8 Q -18 -14 -10 -14 L -8 -14 Q -4 -8 -10 -4 Q -18 -4 -22 -8 Z"
          fill="#061226" />
    <ellipse cx="-16" cy="-9" rx="3" ry="2" fill="#ffd23f" />
  `;
  return g;
}

const ICON_BY_ID = {
  library:       libraryTower,
  phonics:       phonicsConch,
  cloze:         clozeBubble,
  wordPicture:   matchReef,
  buildSentence: sentenceSub,
  stickerBook:   stickersPearl,
  closet:        closetChest,
};

export function buildHotspotIcon(id) {
  const fn = ICON_BY_ID[id];
  return fn ? fn() : null;
}
