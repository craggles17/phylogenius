// Pure helper: given two cards and deck, returns whether they are evolutionarily
// related and a short fun fact about their relationship.
//
// Relationship detection: two cards A and B are related if ANY of:
// 1. Direct prerequisite: A.id ∈ B.prereqIds OR B.id ∈ A.prereqIds
// 2. Enable relationship: A.id ∈ B.enableIds OR B.id ∈ A.enableIds
// 3. Shared prerequisite: A.prereqIds ∩ B.prereqIds ≠ ∅
//
// Otherwise they evolved independently (convergent evolution).

function buildCardsById(deck) {
  const cardsById = {}
  for (const card of deck.cards) {
    cardsById[card.id] = card
  }
  return cardsById
}

function findSharedPrereqs(cardA, cardB) {
  const aSet = new Set(cardA.prereqIds || [])
  return (cardB.prereqIds || []).filter(id => aSet.has(id))
}

export function analyzePairRelation(cardA, cardB, deck) {
  const cardsById = buildCardsById(deck)

  // Direct prerequisite A → B
  if ((cardB.prereqIds || []).includes(cardA.id)) {
    return {
      related: true,
      reason: 'direct-prereq',
      fact: `${cardA.trait} paved the way for ${cardB.trait}!`
    }
  }

  // Direct prerequisite B → A
  if ((cardA.prereqIds || []).includes(cardB.id)) {
    return {
      related: true,
      reason: 'direct-prereq',
      fact: `${cardB.trait} paved the way for ${cardA.trait}!`
    }
  }

  // Enable A → B
  if ((cardA.enableIds || []).includes(cardB.id)) {
    return {
      related: true,
      reason: 'enable',
      fact: `${cardA.trait} unlocked ${cardB.trait}!`
    }
  }

  // Enable B → A
  if ((cardB.enableIds || []).includes(cardA.id)) {
    return {
      related: true,
      reason: 'enable',
      fact: `${cardB.trait} unlocked ${cardA.trait}!`
    }
  }

  // Shared prerequisite
  const shared = findSharedPrereqs(cardA, cardB)
  if (shared.length > 0) {
    const prereqNames = shared
      .map(id => cardsById[id]?.trait || id)
      .join(', ')
    return {
      related: true,
      reason: 'shared-prereq',
      fact: `Both trace back to ${prereqNames}!`
    }
  }

  // Unrelated - convergent evolution
  const facts = [
    'These evolved on separate branches of the tree of life!',
    'Convergent evolution — nature found similar solutions twice!',
    'No direct evolutionary link between these traits!'
  ]
  // Deterministically pick fact based on card IDs (stable for same pair)
  const seed = (cardA.id + cardB.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const factIndex = seed % facts.length

  return {
    related: false,
    reason: 'convergent',
    fact: facts[factIndex]
  }
}
