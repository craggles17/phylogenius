import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canPlace, scoreCladogram, countBranches } from '../game/src/engine/cladogram.js'
import { drawPlayableHand, makeRng } from '../game/src/data.js'

const deck = { hasPrereqs: true }
const root = { id: 'S01', mya: 600, prereqIds: [] }
const child = { id: 'S04', mya: 530, prereqIds: ['S01'] }

test('root with no prereq is placeable', () => {
  assert.equal(canPlace(root, {}, deck).ok, true)
})

test('child needs prereq present and later mya', () => {
  assert.equal(canPlace(child, {}, deck).ok, false) // prereq missing
  assert.equal(canPlace(child, { S01: root }, deck).ok, true)
  assert.equal(canPlace({ ...child, mya: 700 }, { S01: root }, deck).ok, false) // older than parent
})

test('branch bonus', () => {
  assert.equal(scoreCladogram({ placed: 6, branches: 1 }), 6 * 5 + 20)
})

// A connected lineage (linked by prereqIds) of >=5 placed cards counts as one
// branch for the +20 bonus; smaller components do not count.
test('countBranches counts connected components of >=5 placed cards', () => {
  const chain = {}
  for (let i = 0; i < 5; i++) {
    chain[`C${i}`] = { id: `C${i}`, prereqIds: i ? [`C${i - 1}`] : [] }
  }
  assert.equal(countBranches(chain), 1)
  // A separate 3-card lineage stays under the threshold and adds no branch.
  const small = { ...chain }
  for (let i = 0; i < 3; i++) {
    small[`D${i}`] = { id: `D${i}`, prereqIds: i ? [`D${i - 1}`] : [] }
  }
  assert.equal(countBranches(small), 1)
  assert.equal(countBranches({}), 0)
})

// Regression: a random hand can lack any root-eligible card, leaving no legal
// opening move (dead hand). drawPlayableHand must guarantee one when the deck has it.
test('drawPlayableHand never deals a dead opening hand', () => {
  const cards = [
    { id: 'R', mya: 600, prereqIds: [] },
    ...Array.from({ length: 30 }, (_, i) => ({ id: `C${i}`, mya: 500, prereqIds: ['R'] })),
  ]
  const deck = { cards, hasPrereqs: true }
  const canOpen = (card) => canPlace(card, {}, deck).ok
  for (let seed = 0; seed < 50; seed++) {
    const hand = drawPlayableHand(deck, 5, makeRng(seed), canOpen)
    assert.equal(hand.length, 5)
    assert.ok(hand.some(canOpen), `seed ${seed} dealt a dead hand`)
  }
})

test('drawPlayableHand leaves an already-playable hand untouched', () => {
  const cards = Array.from({ length: 10 }, (_, i) => ({ id: `R${i}`, mya: 600, prereqIds: [] }))
  const deck = { cards, hasPrereqs: true }
  const canOpen = () => true
  const direct = drawPlayableHand(deck, 4, makeRng(7), canOpen)
  assert.equal(direct.length, 4)
  assert.equal(new Set(direct.map((c) => c.id)).size, 4, 'no duplicate cards introduced')
})
