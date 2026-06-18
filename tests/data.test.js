import { test } from 'node:test'; import assert from 'node:assert/strict'
import { generateGameData } from '../scripts/generators/game-data.js'
import { readFile } from 'node:fs/promises'
import { drawClosePair, makeRng } from '../game/src/data.js'
import { compareByValue } from '../game/src/engine/timeline.js'

// Which Came First must be a close call: the two cards dealt should sit near each
// other in value order, not be an obvious far-apart gap.
test('drawClosePair deals two distinct cards with nearby values', () => {
  const cards = Array.from({ length: 30 }, (_, i) => ({ id: `C${i}`, mya: (30 - i) * 20 }))
  const deck = { cards, valueType: 'mya' }
  const sorted = cards.slice().sort((a, b) => compareByValue(a, b, deck))
  const pos = (c) => sorted.indexOf(c)
  for (let seed = 0; seed < 40; seed++) {
    const [a, b] = drawClosePair(deck, makeRng(seed), 4)
    assert.notEqual(a.id, b.id, `seed ${seed}: distinct cards`)
    const gap = Math.abs(pos(a) - pos(b))
    assert.ok(gap >= 1 && gap <= 4, `seed ${seed}: sorted gap ${gap} within window`)
  }
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
