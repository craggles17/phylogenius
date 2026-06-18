import { test } from 'node:test'; import assert from 'node:assert/strict'
import { generateGameData } from '../scripts/generators/game-data.js'
import { readFile } from 'node:fs/promises'
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
