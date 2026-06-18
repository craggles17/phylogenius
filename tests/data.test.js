import { test } from 'node:test'; import assert from 'node:assert/strict'
import { generateGameData } from '../scripts/generators/game-data.js'
import { readFile } from 'node:fs/promises'
import { drawClosePair, makeRng, getPairFact } from '../game/src/data.js'
import { compareByValue } from '../game/src/engine/timeline.js'

// Which Came First must be a close call: the two cards dealt should sit near each
// other in value order, not be an obvious far-apart gap. CRITICAL: the two cards must
// NEVER have equal value (no ties — every pair must have a definite earlier card).
test('drawClosePair deals two distinct cards with nearby values and never ties', () => {
  const cards = Array.from({ length: 30 }, (_, i) => ({ id: `C${i}`, mya: (30 - i) * 20 }))
  const deck = { cards, valueType: 'mya' }
  const sorted = cards.slice().sort((a, b) => compareByValue(a, b, deck))
  const pos = (c) => sorted.indexOf(c)
  for (let seed = 0; seed < 40; seed++) {
    const [a, b] = drawClosePair(deck, makeRng(seed), 4)
    assert.notEqual(a.id, b.id, `seed ${seed}: distinct cards`)
    assert.notEqual(compareByValue(a, b, deck), 0, `seed ${seed}: no ties (values must strictly differ)`)
    const gap = Math.abs(pos(a) - pos(b))
    assert.ok(gap >= 1 && gap <= 4, `seed ${seed}: sorted gap ${gap} within window`)
  }
})

test('drawClosePair never deals equal-value cards even with duplicates', () => {
  // Create a deck with many equal-value cards to stress-test tie prevention
  const cards = [
    { id: 'A', mya: 100 }, { id: 'B', mya: 100 }, { id: 'C', mya: 100 },
    { id: 'D', mya: 90 }, { id: 'E', mya: 90 },
    { id: 'F', mya: 80 }
  ]
  const deck = { cards, valueType: 'mya' }
  for (let seed = 0; seed < 20; seed++) {
    const [a, b] = drawClosePair(deck, makeRng(seed), 4)
    assert.notEqual(compareByValue(a, b, deck), 0,
      `seed ${seed}: dealt ${a.id}(${a.mya}) vs ${b.id}(${b.mya}), must not tie`)
  }
})

test('drawClosePair expands beyond window when all cards in window have equal values', () => {
  // Deck with a long run of equal values, then a distinct card beyond window
  const cards = [
    { id: 'A', mya: 100 },
    { id: 'B', mya: 100 }, { id: 'C', mya: 100 }, { id: 'D', mya: 100 },
    { id: 'E', mya: 100 }, { id: 'F', mya: 100 }, { id: 'G', mya: 100 },
    { id: 'H', mya: 50 }  // distinct card beyond window=4
  ]
  const deck = { cards, valueType: 'mya' }
  // Force seed to pick index 0, so window [1..4] all have mya=100, but index 7 differs
  const rng = makeRng(0)
  // Manually create rng that returns 0
  const mockRng = () => 0
  const [a, b] = drawClosePair(deck, mockRng, 4)
  assert.notEqual(compareByValue(a, b, deck), 0, 'must find distinct card beyond window')
  // Should pair A (mya=100) with H (mya=50)
  const values = [a.mya, b.mya].sort((x, y) => y - x)
  assert.ok(values.includes(100) && values.includes(50), 'should pair 100 with 50')
})

test('drawClosePair searches backwards when forward window and expansion fail', () => {
  // Deck where the last card(s) have equal values, forcing backward search
  const cards = [
    { id: 'A', mya: 100 },
    { id: 'B', mya: 90 },
    { id: 'C', mya: 80 },
    { id: 'D', mya: 70 },
    { id: 'E', mya: 70 }, { id: 'F', mya: 70 }, { id: 'G', mya: 70 }  // last cards all equal
  ]
  const deck = { cards, valueType: 'mya' }
  // Force seed to pick index 4 (mya=70), all forward cards also 70, must go backward
  const mockRng = () => 4 / (cards.length - 1)
  const [a, b] = drawClosePair(deck, mockRng, 4)
  assert.notEqual(compareByValue(a, b, deck), 0, 'must find distinct card backward')
  // Should pair one of the 70s with D (mya=70) -> wait, D is also 70... let me fix this
  const values = [a.mya, b.mya]
  assert.ok(values.includes(70), 'one card should be 70')
  assert.ok(values.some(v => v !== 70), 'other card should differ from 70')
})

test('drawClosePair backward search finds distinct card', () => {
  // Simpler test: cards where forward search from near-end fails, must go backward
  const cards = [
    { id: 'A', mya: 100 },
    { id: 'B', mya: 50 },
    { id: 'C', mya: 30 }, { id: 'D', mya: 30 }, { id: 'E', mya: 30 }
  ]
  const deck = { cards, valueType: 'mya' }
  // Pick index near end where forward window is all equal
  const mockRng = () => 2 / (cards.length - 1)  // picks index 2 (mya=30)
  const [a, b] = drawClosePair(deck, mockRng, 4)
  assert.notEqual(compareByValue(a, b, deck), 0, 'must find distinct card')
  // Should pair one of the 30s with B (mya=50) via backward search
  const values = new Set([a.mya, b.mya])
  assert.ok(values.has(30) && (values.has(100) || values.has(50)),
    'should pair 30 with a different value via backward search')
})
test('cards.json has all decks with non-empty ids and resolved values', async () => {
  await generateGameData()
  const data = JSON.parse(await readFile('dist/game/cards.json','utf8'))
  for (const id of ['evo','cambrian','human']) assert.ok(data.decks[id].cards.length > 0)
  const evo = data.decks.evo.cards
  assert.ok(evo.every(c => c.id && c.id.length >= 2))            // bug fix: ids present
  const vc = evo.find(c => c.trait === 'Vertebral Column')
  assert.deepEqual(vc.prereqIds, ['S04'])                        // alias: Notochord
  const human = data.decks.human.cards
  assert.ok(human.some(c => c.globalPercent > 0))                // bug fix: freq parsed
  assert.equal(data.decks.human.valueType, 'percent')
  assert.equal(data.decks.evo.hasPrereqs, true)
})

// type:"special" cards (extinction/wild) have no usable mya/percent; left in the
// deck they make timeline orderValue NaN (always "correct") and pollute cladogram.
test('cards.json excludes type:"special" cards from every deck', async () => {
  await generateGameData()
  const data = JSON.parse(await readFile('dist/game/cards.json', 'utf8'))
  for (const id of ['evo', 'cambrian', 'human']) {
    assert.ok(
      data.decks[id].cards.every(c => c.type !== 'special'),
      `${id} deck still contains special cards`
    )
  }
})

test('no card has filler flavour text that leaks values', async () => {
  await generateGameData()
  const data = JSON.parse(await readFile('dist/game/cards.json', 'utf8'))
  for (const id of ['evo', 'cambrian', 'human']) {
    for (const card of data.decks[id].cards) {
      if (card.flavour) {
        assert.ok(
          !card.flavour.includes('million years ago') &&
          !card.flavour.includes('Encoded by'),
          `${id}/${card.id}: flavour "${card.flavour}" contains filler text`
        )
      }
    }
  }
})

test('substantial fun fact coverage across all decks', async () => {
  await generateGameData()
  const data = JSON.parse(await readFile('dist/game/cards.json', 'utf8'))

  // Each deck should have at least 15 cards with non-empty flavour text
  const evoWithFlavour = data.decks.evo.cards.filter(c => c.flavour && c.flavour.trim()).length
  const cambrianWithFlavour = data.decks.cambrian.cards.filter(c => c.flavour && c.flavour.trim()).length
  const humanWithFlavour = data.decks.human.cards.filter(c => c.flavour && c.flavour.trim()).length

  assert.ok(evoWithFlavour >= 15, `evo deck has only ${evoWithFlavour} cards with flavour (need >=15)`)
  assert.ok(cambrianWithFlavour >= 15, `cambrian deck has only ${cambrianWithFlavour} cards with flavour (need >=15)`)
  assert.ok(humanWithFlavour >= 15, `human deck has only ${humanWithFlavour} cards with flavour (need >=15)`)

  // No flavour should contain number + "million years ago" or a percentage leak
  for (const id of ['evo', 'cambrian', 'human']) {
    for (const card of data.decks[id].cards) {
      if (card.flavour) {
        assert.ok(
          !/\d+\s*million\s+years\s+ago/i.test(card.flavour),
          `${id}/${card.id}: flavour leaks MYA: "${card.flavour}"`
        )
        assert.ok(
          !/\d+\s*%/.test(card.flavour),
          `${id}/${card.id}: flavour leaks percent: "${card.flavour}"`
        )
      }
    }
  }
})

test('getPairFact returns relation fact when cards are related', () => {
  const cardA = { id: 'A', trait: 'Multicellularity', prereqIds: [], enableIds: [], mya: 1000 }
  const cardB = { id: 'B', trait: 'Tissues', prereqIds: ['A'], enableIds: [], mya: 900 }
  const deck = { cards: [cardA, cardB], valueType: 'mya' }
  const fact = getPairFact(cardA, cardB, deck)
  assert.ok(fact.includes('Multicellularity'))
  assert.ok(fact.includes('Tissues'))
})

test('getPairFact falls back to earlier card flavour when unrelated', () => {
  const cardA = { id: 'A', trait: 'Trait A', mya: 1000, flavour: 'Card A flavour text' }
  const cardB = { id: 'B', trait: 'Trait B', mya: 500, flavour: 'Card B flavour text' }
  const deck = { cards: [cardA, cardB], valueType: 'mya' }
  const fact = getPairFact(cardA, cardB, deck)
  assert.equal(fact, 'Card A flavour text')
})

test('getPairFact falls back to later card flavour if earlier has none', () => {
  const cardA = { id: 'A', trait: 'Trait A', mya: 1000 }
  const cardB = { id: 'B', trait: 'Trait B', mya: 500, flavour: 'Card B flavour text' }
  const deck = { cards: [cardA, cardB], valueType: 'mya' }
  const fact = getPairFact(cardA, cardB, deck)
  assert.equal(fact, 'Card B flavour text')
})

test('getPairFact returns convergent fact when no flavour', () => {
  const cardA = { id: 'A', trait: 'Trait A', mya: 1000 }
  const cardB = { id: 'B', trait: 'Trait B', mya: 500 }
  const deck = { cards: [cardA, cardB], valueType: 'mya' }
  const fact = getPairFact(cardA, cardB, deck)
  // Should return convergent evolution fact (deterministic based on card IDs)
  assert.ok(fact.length > 0)
  assert.ok(
    fact.includes('separate branches') ||
    fact.includes('Convergent evolution') ||
    fact.includes('No direct evolutionary link')
  )
})

test('getPairFact handles percent deck', () => {
  const cardA = { id: 'A', trait: 'Trait A', percent: 0.1, flavour: 'Rare trait' }
  const cardB = { id: 'B', trait: 'Trait B', percent: 0.5 }
  const deck = { cards: [cardA, cardB], valueType: 'percent' }
  const fact = getPairFact(cardA, cardB, deck)
  assert.equal(fact, 'Rare trait')
})

test('getPairFact handles enable relationship', () => {
  const cardA = { id: 'A', trait: 'Jaws', prereqIds: [], enableIds: ['B'], mya: 1000 }
  const cardB = { id: 'B', trait: 'Predation', prereqIds: [], enableIds: [], mya: 900 }
  const deck = { cards: [cardA, cardB], valueType: 'mya' }
  const fact = getPairFact(cardA, cardB, deck)
  assert.ok(fact.includes('unlocked'))
})
