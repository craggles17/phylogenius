// Cladogram placement validity + scoring (pure; no DOM).

const PLACE_POINTS = 5
const BRANCH_BONUS = 20

// Can `card` join the tree given the cards already placed (id -> card)?
// Root-eligible when prereqIds empty; otherwise all prereqs must be present
// and the card must be strictly later (smaller mya) than each parent.
export function canPlace(card, placedById, deck) {
  const prereqs = card.prereqIds || []
  if (prereqs.length === 0) return { ok: true, reason: 'root' }

  const missing = prereqs.filter((id) => !placedById[id])
  if (missing.length > 0) {
    return { ok: false, reason: `missing prereqs: ${missing.join(', ')}` }
  }

  const minParentMya = Math.min(...prereqs.map((id) => placedById[id].mya))
  if (!(card.mya < minParentMya)) {
    return { ok: false, reason: 'must be later than its parents' }
  }
  return { ok: true, reason: 'valid descendant' }
}

export function scoreCladogram({ placed, branches }) {
  return placed * PLACE_POINTS + branches * BRANCH_BONUS
}

const BRANCH_MIN = 5

// Count connected components (cards linked by prereqIds, undirected) of placed
// cards whose size reaches BRANCH_MIN. `placedById` is an id -> card map.
export function countBranches(placedById) {
  const adjacency = buildAdjacency(placedById)
  const seen = new Set()
  let branches = 0
  for (const id of Object.keys(placedById)) {
    if (seen.has(id)) continue
    if (componentSize(id, adjacency, seen) >= BRANCH_MIN) branches++
  }
  return branches
}

function buildAdjacency(placedById) {
  const adjacency = new Map(Object.keys(placedById).map((id) => [id, []]))
  for (const card of Object.values(placedById)) {
    for (const parent of card.prereqIds || []) {
      if (!adjacency.has(parent)) continue
      adjacency.get(card.id).push(parent)
      adjacency.get(parent).push(card.id)
    }
  }
  return adjacency
}

function componentSize(start, adjacency, seen) {
  let size = 0
  const stack = [start]
  while (stack.length) {
    const id = stack.pop()
    if (seen.has(id)) continue
    seen.add(id)
    size++
    stack.push(...adjacency.get(id))
  }
  return size
}
