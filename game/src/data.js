// Deck loading, indexing, deterministic hand-dealing.

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
