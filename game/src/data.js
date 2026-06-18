// Deck loading, indexing, deterministic hand-dealing.

import { compareByValue } from './engine/timeline.js'
import { analyzePairRelation } from './engine/pair-relations.js'

// Deterministic PRNG (mulberry32). Returns a function emitting [0,1).
export function makeRng(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export async function loadDecks(url = 'cards.json') {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load decks: ${res.status}`)
  return res.json()
}

export function getDeck(data, id) {
  return data.decks[id]
}

// Pure given rng: shuffle a copy (Fisher–Yates) and take the first n.
export function drawHand(deck, n, rng) {
  const cards = deck.cards.slice()
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards.slice(0, n)
}

// Like drawHand, but never deals a dead hand: when the deck has a card the player
// could open on (canOpen) yet the random draw includes none, swap one in. Pure
// given rng. `canOpen` is the mode's legal-first-move predicate.
export function drawPlayableHand(deck, n, rng, canOpen) {
  const hand = drawHand(deck, n, rng)
  if (hand.some(canOpen)) return hand
  const openers = deck.cards.filter(canOpen)
  if (openers.length === 0) return hand
  const opener = openers[Math.floor(rng() * openers.length)]
  hand[Math.floor(rng() * hand.length)] = opener
  return hand
}

// Deal two distinct cards with nearby order-values so "which came first" is a genuine
// close call rather than an obvious gap. NEVER deals two cards with equal value (no
// ties — every pair must have a definite earlier card). Pure given rng: sort by value,
// pick a random card, then a partner within `window` positions of it that has a
// strictly different value.
export function drawClosePair(deck, rng, window = 4) {
  const sorted = deck.cards.slice().sort((a, b) => compareByValue(a, b, deck))
  if (sorted.length < 2) return sorted.slice(0, 2)
  const i = Math.floor(rng() * (sorted.length - 1))
  const span = Math.min(window, sorted.length - 1 - i)
  // Find first offset where the value strictly differs
  for (let offset = 1; offset <= span; offset++) {
    const candidate = sorted[i + offset]
    if (compareByValue(sorted[i], candidate, deck) !== 0) {
      return [sorted[i], candidate]
    }
  }
  // If all cards in the window have equal value, expand search beyond window
  for (let offset = span + 1; offset < sorted.length - i; offset++) {
    const candidate = sorted[i + offset]
    if (compareByValue(sorted[i], candidate, deck) !== 0) {
      return [sorted[i], candidate]
    }
  }
  // Fallback: search backwards if needed
  for (let j = i - 1; j >= 0; j--) {
    if (compareByValue(sorted[j], sorted[i], deck) !== 0) {
      return [sorted[j], sorted[i]]
    }
  }
  // If the entire deck has identical values, return the first two distinct cards by id
  return sorted.slice(0, 2)
}

// Difficulty -> closeness window mapping. Smaller window = closer values = harder.
export const DIFFICULTY_WINDOWS = {
  Easy: 10,
  Medium: 5,
  Hard: 2,
}

// Deal n cards with all distinct values (no ties) and bounded by window closeness.
// Pure given rng. Analogous to drawClosePair but for n cards instead of 2.
export function drawCloseHand(deck, n, rng, window = 4) {
  if (deck.cards.length < n) return deck.cards.slice()
  const sorted = deck.cards.slice().sort((a, b) => compareByValue(a, b, deck))
  if (sorted.length < 2) return sorted.slice(0, n)

  // Pick a random starting position that allows window room
  const maxStart = Math.max(0, sorted.length - window)
  const start = Math.floor(rng() * (maxStart + 1))
  const windowEnd = Math.min(start + window, sorted.length)

  // Collect distinct-value cards within window
  const hand = []
  const seen = new Set()
  for (let i = start; i < windowEnd && hand.length < n; i++) {
    const card = sorted[i]
    const key = deck.valueType === 'mya' ? card.mya : card.globalPercent
    if (!seen.has(key)) {
      hand.push(card)
      seen.add(key)
    }
  }

  // If we need more cards, expand beyond window
  if (hand.length < n) {
    for (let i = windowEnd; i < sorted.length && hand.length < n; i++) {
      const card = sorted[i]
      const key = deck.valueType === 'mya' ? card.mya : card.globalPercent
      if (!seen.has(key)) {
        hand.push(card)
        seen.add(key)
      }
    }
    for (let i = start - 1; i >= 0 && hand.length < n; i--) {
      const card = sorted[i]
      const key = deck.valueType === 'mya' ? card.mya : card.globalPercent
      if (!seen.has(key)) {
        hand.push(card)
        seen.add(key)
      }
    }
  }

  return hand
}

// Pure: given two cards and deck, return a fun fact about their relationship.
// If the pair has an evolutionary relationship (prereq/enable/shared prereq), returns
// that relationship fact. Otherwise, returns the flavour text from one of the cards
// (prefers the earlier card if both have flavour).
export function getPairFact(cardA, cardB, deck) {
  const relation = analyzePairRelation(cardA, cardB, deck)

  // Prefer pair-specific relationship facts
  if (relation.related && relation.fact) {
    return relation.fact
  }

  // Fallback to individual card flavour
  // Sort by value to prefer earlier card's fact
  const sorted = compareByValue(cardA, cardB, deck) <= 0
    ? [cardA, cardB]
    : [cardB, cardA]

  for (const card of sorted) {
    if (card.flavour) return card.flavour
  }

  // Ultimate fallback
  return relation.fact || 'Two fascinating evolutionary innovations!'
}
