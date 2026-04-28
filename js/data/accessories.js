// Hero gear (Phase B). Each entry declares which species the gear
// renders on (must match a real branch in koala.js / panda.js — Shark
// Hero / Octopus Hero) and how the kid unlocks it. Unlock kinds:
//   { type: 'default' }                  → unlocked from day one
//   { type: 'stat',  key: 'booksRead', n: 3 }  → kpr.stats[key] >= n
//   { type: 'badge', id: 'first-book' }  → that badge is earned
//
// Item IDs are kept verbatim (leaf, hat, bamboo, bow, …) for
// backward compat with persisted buddy state and tests; the user-
// facing LABEL is the sea-hero gear name.

export const ACCESSORIES = [
  // Defaults — picked during onboarding.
  { id: 'leaf',    label: 'Hero Emblem',  species: ['koala'],          unlock: { type: 'default' } },
  { id: 'hat',     label: 'Hero Mask',    species: ['koala'],          unlock: { type: 'default' } },
  { id: 'bamboo',  label: 'Sea Scepter',  species: ['panda'],          unlock: { type: 'default' } },
  { id: 'bow',     label: 'Pink Bow',     species: ['panda'],          unlock: { type: 'default' } },

  // Earned via reading milestones — surfaced in the closet once
  // unlocked. Stat keys must exist in kpr.stats (see badges.js).
  { id: 'crown',   label: 'Sea Crown',      species: ['koala','panda'], unlock: { type: 'stat',  key: 'booksRead',     n: 3 } },
  { id: 'glasses', label: 'Scuba Goggles',  species: ['koala','panda'], unlock: { type: 'stat',  key: 'pagesMastered', n: 5 } },
  { id: 'scarf',   label: 'Power Belt',     species: ['koala','panda'], unlock: { type: 'stat',  key: 'wordsTapped',   n: 25 } },
  { id: 'flower',  label: 'Starfish Badge', species: ['koala','panda'], unlock: { type: 'badge', id:  'first-book' } },
];

// Map from badge id → accessory id, used by badges.js to fire a
// celebratory unlockAccessory(...) right when the badge lands. Values
// must reference accessories with unlock.type === 'badge'.
export const BADGE_TO_ACCESSORY = {
  'first-book': 'flower',
};

export function findAccessory(id) {
  return ACCESSORIES.find((a) => a.id === id) || null;
}

export function accessoriesForSpecies(species) {
  return ACCESSORIES.filter((a) => a.species.includes(species));
}
