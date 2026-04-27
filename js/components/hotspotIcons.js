// Custom SVG icons for the world-map hotspot bubbles. Replaces the
// previous emoji glyphs with scene-style illustrations that read as
// "drawn into" each bubble. Pure SVG, no images, no fonts.
//
//   import { buildHotspotIcon } from '../components/hotspotIcons.js';
//   bubbleGroup.appendChild(buildHotspotIcon('library'));
//
// Each builder returns an <svg> element sized 0..100 in user units;
// the world-map scales it to the bubble interior via a wrapping <g>.
//
// Design intent: every icon evokes its place, not just its emoji.
//   library     → tree-house with a warm-glow window + ladder
//   phonics     → cave mouth with letters scattered around it
//   cloze       → pond with ripples and a lily pad
//   wordPicture → meadow with a sun, flowers, and a path
//   buildSentence → wooden workbench with stacked word blocks
//   stickerBook → sunburst + a star sticker
//   closet      → wardrobe with a door cracked open and a bow on top

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg() {
  const s = document.createElementNS(SVG_NS, 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.setAttribute('xmlns', SVG_NS);
  s.setAttribute('class', 'hotspot-icon');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  return s;
}

const ICONS = {
  // Books → a treehouse: trunk, layered canopy, ladder up the trunk,
  // and a square window with a warm yellow glow.
  library() {
    const s = svg();
    s.innerHTML = `
      <!-- canopy back -->
      <ellipse cx="50" cy="32" rx="38" ry="24" fill="#3f8a44" />
      <!-- canopy front (lighter, offset for depth) -->
      <ellipse cx="44" cy="28" rx="30" ry="20" fill="#6dbf6a" />
      <ellipse cx="62" cy="34" rx="22" ry="14" fill="#8cd58a" />
      <!-- a few leaf dots for texture -->
      <circle cx="30" cy="22" r="3" fill="#ffffff" opacity="0.4" />
      <circle cx="60" cy="20" r="2" fill="#ffffff" opacity="0.5" />
      <!-- trunk -->
      <rect x="44" y="46" width="12" height="38" fill="#7a4a26" />
      <rect x="44" y="46" width="12" height="38" fill="url(#bark-stripes)" opacity="0.25" />
      <!-- ladder up the trunk -->
      <line x1="40" y1="50" x2="40" y2="80" stroke="#5a3216" stroke-width="1.5" />
      <line x1="60" y1="50" x2="60" y2="80" stroke="#5a3216" stroke-width="1.5" />
      <line x1="40" y1="56" x2="60" y2="56" stroke="#5a3216" stroke-width="1.5" />
      <line x1="40" y1="64" x2="60" y2="64" stroke="#5a3216" stroke-width="1.5" />
      <line x1="40" y1="72" x2="60" y2="72" stroke="#5a3216" stroke-width="1.5" />
      <!-- window with warm glow -->
      <rect x="46" y="54" width="8" height="8" fill="#ffd166" />
      <rect x="46" y="54" width="8" height="8" fill="none" stroke="#5a3216" stroke-width="1" />
      <line x1="50" y1="54" x2="50" y2="62" stroke="#5a3216" stroke-width="0.8" />
      <line x1="46" y1="58" x2="54" y2="58" stroke="#5a3216" stroke-width="0.8" />
    `;
    return s;
  },

  // Sounds → a cave mouth (dark interior, lighter inner) with letters
  // around it; reads as "phonics" without spelling it.
  phonics() {
    const s = svg();
    s.innerHTML = `
      <!-- ground -->
      <ellipse cx="50" cy="86" rx="40" ry="6" fill="#7a8c4a" opacity="0.5" />
      <!-- cave mouth: outer rock arch -->
      <path d="M 18 80 Q 18 36 50 36 Q 82 36 82 80 Z" fill="#5a4a55" />
      <!-- inner mouth (lighter to suggest depth) -->
      <path d="M 26 78 Q 26 44 50 44 Q 74 44 74 78 Z" fill="#2c2230" />
      <!-- glowing letters scattered around -->
      <text x="14" y="32" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ff7eb6">a</text>
      <text x="80" y="28" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#ffd166">b</text>
      <text x="86" y="62" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#7ed47b">c</text>
      <text x="6"  y="58" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#7fc8ff">d</text>
      <text x="46" y="22" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ff5d5d">e</text>
    `;
    return s;
  },

  // Fill In → a pond with ripples and a lily pad; the empty water
  // suggests a "blank waiting to be filled."
  cloze() {
    const s = svg();
    s.innerHTML = `
      <!-- pond ellipse -->
      <ellipse cx="50" cy="62" rx="38" ry="22" fill="#5cb1de" />
      <ellipse cx="50" cy="60" rx="36" ry="20" fill="#7fc8ff" />
      <!-- ripples -->
      <ellipse cx="50" cy="60" rx="22" ry="12" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.7" />
      <ellipse cx="50" cy="60" rx="14" ry="8"  fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5" />
      <ellipse cx="50" cy="60" rx="6"  ry="4"  fill="none" stroke="#ffffff" stroke-width="1" opacity="0.3" />
      <!-- lily pad -->
      <ellipse cx="32" cy="56" rx="11" ry="6" fill="#3f8a44" />
      <path d="M 32 56 L 36 50" stroke="#3f8a44" stroke-width="1.5" fill="none" />
      <!-- flower on pad -->
      <circle cx="28" cy="54" r="2.5" fill="#ff7eb6" />
      <circle cx="28" cy="54" r="1"   fill="#ffd166" />
      <!-- second smaller pad -->
      <ellipse cx="68" cy="68" rx="7" ry="4" fill="#6dbf6a" />
      <!-- a fish silhouette -->
      <path d="M 56 64 q 2 -2 6 0 q -2 2 -6 0 m 6 0 l 2 -1 v 2 z" fill="#ffd166" opacity="0.85" />
    `;
    return s;
  },

  // Match → meadow with a sun, hills, flowers; matching = pairing,
  // and the meadow suggests cards laid out side by side.
  wordPicture() {
    const s = svg();
    s.innerHTML = `
      <!-- back hill -->
      <path d="M 0 70 Q 30 52 60 60 T 100 64 V 100 H 0 Z" fill="#6dbf6a" />
      <!-- front hill -->
      <path d="M 0 80 Q 25 70 50 76 T 100 78 V 100 H 0 Z" fill="#3f8a44" />
      <!-- sun -->
      <circle cx="78" cy="22" r="11" fill="#ffd166" />
      <g stroke="#f5b842" stroke-width="1.5" stroke-linecap="round">
        <line x1="78" y1="6"  x2="78" y2="10" />
        <line x1="78" y1="34" x2="78" y2="38" />
        <line x1="62" y1="22" x2="66" y2="22" />
        <line x1="90" y1="22" x2="94" y2="22" />
        <line x1="68" y1="12" x2="71" y2="15" />
        <line x1="88" y1="12" x2="85" y2="15" />
      </g>
      <!-- flowers -->
      <circle cx="20" cy="76" r="2.5" fill="#ff5d5d" /><circle cx="20" cy="76" r="1" fill="#ffd166" />
      <circle cx="34" cy="82" r="2.5" fill="#ff7eb6" /><circle cx="34" cy="82" r="1" fill="#ffd166" />
      <circle cx="68" cy="84" r="2.5" fill="#7fc8ff" /><circle cx="68" cy="84" r="1" fill="#ffffff" />
      <!-- grass blades -->
      <path d="M 12 90 l 1 -6 l 1 6 z" fill="#3f8a44" />
      <path d="M 50 92 l 1 -6 l 1 6 z" fill="#3f8a44" />
      <path d="M 82 90 l 1 -6 l 1 6 z" fill="#3f8a44" />
    `;
    return s;
  },

  // Build → a tiny carpenter's workbench with stacked word blocks.
  buildSentence() {
    const s = svg();
    s.innerHTML = `
      <!-- workbench top -->
      <rect x="14" y="62" width="72" height="8" fill="#a0673a" />
      <rect x="14" y="62" width="72" height="8" fill="url(#bench-grain)" opacity="0.25" />
      <!-- legs -->
      <rect x="20" y="70" width="6" height="20" fill="#7a4a26" />
      <rect x="74" y="70" width="6" height="20" fill="#7a4a26" />
      <!-- crossbar -->
      <rect x="20" y="84" width="60" height="3" fill="#7a4a26" />
      <!-- block 1 (yellow) -->
      <rect x="22" y="50" width="20" height="12" fill="#ffd166" stroke="#5a3216" stroke-width="1.2" />
      <text x="32" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#5a3216" text-anchor="middle">The</text>
      <!-- block 2 (pink) -->
      <rect x="44" y="50" width="22" height="12" fill="#ff7eb6" stroke="#5a3216" stroke-width="1.2" />
      <text x="55" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#5a3216" text-anchor="middle">cat</text>
      <!-- block 3 (green) -->
      <rect x="68" y="50" width="14" height="12" fill="#7ed47b" stroke="#5a3216" stroke-width="1.2" />
      <text x="75" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#5a3216" text-anchor="middle">is</text>
      <!-- a stacked block on top (purple) -->
      <rect x="32" y="38" width="22" height="12" fill="#c89bff" stroke="#5a3216" stroke-width="1.2" />
      <text x="43" y="48" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#5a3216" text-anchor="middle">big</text>
      <!-- pencil -->
      <line x1="60" y1="42" x2="74" y2="32" stroke="#ffd166" stroke-width="3" stroke-linecap="round" />
      <line x1="60" y1="42" x2="62" y2="40" stroke="#5a3216" stroke-width="3" stroke-linecap="round" />
    `;
    return s;
  },

  // Stickers → a sunburst with a big gold star sticker on top.
  stickerBook() {
    const s = svg();
    s.innerHTML = `
      <!-- sunburst rays -->
      <g stroke="#ffd166" stroke-width="4" stroke-linecap="round" opacity="0.85">
        <line x1="50" y1="10" x2="50" y2="22" />
        <line x1="50" y1="78" x2="50" y2="90" />
        <line x1="10" y1="50" x2="22" y2="50" />
        <line x1="78" y1="50" x2="90" y2="50" />
        <line x1="22" y1="22" x2="30" y2="30" />
        <line x1="78" y1="22" x2="70" y2="30" />
        <line x1="22" y1="78" x2="30" y2="70" />
        <line x1="78" y1="78" x2="70" y2="70" />
      </g>
      <!-- star sticker (5-point), drawn from a path -->
      <g transform="translate(50 50)">
        <path d="M 0 -22 L 6 -7 L 22 -7 L 9 3 L 14 18 L 0 9 L -14 18 L -9 3 L -22 -7 L -6 -7 Z"
              fill="#ffd166" stroke="#5a3216" stroke-width="2" stroke-linejoin="round" />
        <!-- inner highlight -->
        <path d="M -3 -10 L 0 -16 L 3 -10 Z" fill="#fff5cc" />
      </g>
      <!-- a small heart sticker peeking out -->
      <g transform="translate(78 70) rotate(15)">
        <path d="M 0 4 Q -4 0 -4 -3 Q -4 -6 0 -6 Q 4 -6 4 -3 Q 4 0 0 4 Z"
              fill="#ff5d5d" stroke="#5a3216" stroke-width="1" />
      </g>
    `;
    return s;
  },

  // Closet → a small wardrobe with the door cracked open and a hat
  // peeking out + a bow on the top.
  closet() {
    const s = svg();
    s.innerHTML = `
      <!-- wardrobe body -->
      <rect x="22" y="20" width="56" height="68" fill="#a0673a" stroke="#5a3216" stroke-width="2" />
      <!-- bow on top -->
      <ellipse cx="50" cy="20" rx="6" ry="4" fill="#ff7eb6" />
      <ellipse cx="44" cy="20" rx="3" ry="4" fill="#ff5d5d" />
      <ellipse cx="56" cy="20" rx="3" ry="4" fill="#ff5d5d" />
      <circle cx="50" cy="20" r="2" fill="#ffd166" />
      <!-- left door (closed) -->
      <rect x="24" y="24" width="24" height="60" fill="#c4895a" stroke="#5a3216" stroke-width="1" />
      <circle cx="44" cy="54" r="1.5" fill="#5a3216" />
      <!-- right door (cracked open, rotated slightly) -->
      <g transform="rotate(-12 52 24)">
        <rect x="52" y="24" width="24" height="60" fill="#c4895a" stroke="#5a3216" stroke-width="1" />
        <circle cx="56" cy="54" r="1.5" fill="#5a3216" />
      </g>
      <!-- a hat peeking out -->
      <g transform="translate(58 40)">
        <ellipse cx="0" cy="6" rx="12" ry="2.5" fill="#5a3216" />
        <rect x="-6" y="-4" width="12" height="10" fill="#5a3216" />
        <rect x="-6" y="2"  width="12" height="2"  fill="#ff5d5d" />
      </g>
    `;
    return s;
  },
};

export function buildHotspotIcon(id) {
  const builder = ICONS[id];
  if (!builder) {
    // Safe fallback: an empty bubble interior.
    return svg();
  }
  return builder();
}

export function listHotspotIconIds() {
  return Object.keys(ICONS);
}
