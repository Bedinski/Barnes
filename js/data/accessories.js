// Buddy accessories (Phase B). Each entry declares which species the
// accessory renders on (must match a real branch in koala.js / panda.js)
// and how the kid unlocks it. Unlock kinds:
//   { type: 'default' }                  → unlocked from day one
//   { type: 'stat',  key: 'booksRead', n: 3 }  → kpr.stats[key] >= n
//   { type: 'badge', id: 'first-book' }  → that badge is earned

export const ACCESSORIES = [
  // Defaults — picked during onboarding.
  { id: 'leaf',    label: 'Eucalyptus Leaf', species: ['koala'],          unlock: { type: 'default' } },
  { id: 'hat',     label: 'Red Hat',         species: ['koala'],          unlock: { type: 'default' } },
  { id: 'bamboo',  label: 'Bamboo',          species: ['panda'],          unlock: { type: 'default' } },
  { id: 'bow',     label: 'Pink Bow',        species: ['panda'],          unlock: { type: 'default' } },

  // Earned via reading milestones — surfaced in the closet once
  // unlocked. Stat keys must exist in kpr.stats (see badges.js).
  { id: 'crown',   label: 'Royal Crown',     species: ['koala','panda'], unlock: { type: 'stat',  key: 'booksRead',     n: 3 } },
  { id: 'glasses', label: 'Reading Glasses', species: ['koala','panda'], unlock: { type: 'stat',  key: 'pagesMastered', n: 5 } },
  { id: 'scarf',   label: 'Cozy Scarf',      species: ['koala','panda'], unlock: { type: 'stat',  key: 'wordsTapped',   n: 25 } },
  { id: 'flower',  label: 'Pink Flower',     species: ['koala','panda'], unlock: { type: 'badge', id:  'first-book' } },
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
