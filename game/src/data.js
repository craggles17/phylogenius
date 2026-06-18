// Deck loading, indexing, deterministic hand-dealing.

import { compareByValue } from './engine/timeline.js'

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
// close call rather than an obvious gap. Pure given rng: sort by value, pick a random
// card, then a partner within `window` positions of it.
export function drawClosePair(deck, rng, window = 4) {
  const sorted = deck.cards.slice().sort((a, b) => compareByValue(a, b, deck))
  if (sorted.length < 2) return sorted.slice(0, 2)
  const i = Math.floor(rng() * (sorted.length - 1))
  const span = Math.min(window, sorted.length - 1 - i)
  const offset = 1 + Math.floor(rng() * span)
  return [sorted[i], sorted[i + offset]]
}
