// Resolve free-text prereq/enables strings to canonical card ids within a deck.
//
// Strategy, in order: exact trait match -> case-insensitive -> token-subset
// (e.g. "Vertebrae" <-> "Vertebral Column") -> curated alias map. Unresolved
// tokens are dropped and warned (no silent loss).

// Curated aliases: free-text token -> canonical trait name (within the same deck).
const ALIAS_MAP = {
  vertebrae: 'Vertebral Column',
  'vertebral column': 'Vertebral Column',
  bilateral: 'Bilateral Symmetry',
  'bony skeleton': 'Bony Skeleton',
  'segmented body': 'Segmentation',
  segments: 'Segmentation',
  multicellular: 'Multicellularity',
  eye: 'Eyes',
  limb: 'Limbs',
  lung: 'Lungs',
  jaw: 'Jaws',
  // Prereq free-text that names a concept rather than the exact card trait.
  gametes: 'Gamete Dimorphism',
  'egg/sperm': 'Gamete Dimorphism',
  'internal fert': 'Internal Fertilisation',
  'internal fert.': 'Internal Fertilisation',
  prokaryote: 'Prokaryotic Cell',
  eukaryote: 'Eukaryotic Cell',
  'four-ch. heart': 'Four-Chambered Heart'
}

const WORD = /[a-z0-9]+/g

function tokens(str) {
  return (str.toLowerCase().match(WORD) || [])
}

function tokenSubset(needle, hayTrait) {
  const a = new Set(tokens(needle))
  const b = new Set(tokens(hayTrait))
  if (a.size === 0 || b.size === 0) return false
  const [small, big] = a.size <= b.size ? [a, b] : [b, a]
  for (const t of small) if (!big.has(t)) return false
  return true
}

function findByTrait(traitName, deckCards) {
  return deckCards.find(c => (c.trait || '').toLowerCase() === traitName.toLowerCase())
}

function resolveToken(token, deckCards) {
  const t = token.trim()
  if (!t || t === '-') return null

  // exact (case-sensitive)
  let hit = deckCards.find(c => c.trait === t)
  if (hit) return hit.id

  // case-insensitive
  hit = findByTrait(t, deckCards)
  if (hit) return hit.id

  // token-subset (one trait's words are a subset of the other's)
  hit = deckCards.find(c => tokenSubset(t, c.trait || ''))
  if (hit) return hit.id

  // curated alias map
  const canonical = ALIAS_MAP[t.toLowerCase()]
  if (canonical) {
    hit = findByTrait(canonical, deckCards)
    if (hit) return hit.id
  }

  console.warn(`[trait-aliases] unresolved prereq/enables token: "${t}"`)
  return null
}

// `ownerId` is the id of the card whose prereqs/enables are being resolved; it is
// excluded so a token-subset match can never resolve a card to itself (e.g. M08
// "Four-Chambered Heart" with prereq "Heart" must not depend on M08).
export function resolvePrereqIds(prereqText, deckCards, ownerId) {
  if (!prereqText) return []
  const ids = prereqText
    .split(',')
    .map(s => resolveToken(s, deckCards))
    .filter(id => id && id !== ownerId)
  return [...new Set(ids)]
}
