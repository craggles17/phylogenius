import { test } from 'node:test'
import assert from 'node:assert/strict'
import { drawHand, makeRng } from '../game/src/data.js'
import { createSession, addScore, loseLife } from '../game/src/state.js'

test('drawHand deterministic for a seed', () => {
  const deck = { cards: Array.from({ length: 20 }, (_, i) => ({ id: i })) }
  assert.deepEqual(drawHand(deck, 5, makeRng(1)), drawHand(deck, 5, makeRng(1)))
})

test('drawHand differs across seeds and returns n cards', () => {
  const deck = { cards: Array.from({ length: 20 }, (_, i) => ({ id: i })) }
  const a = drawHand(deck, 5, makeRng(1))
  const b = drawHand(deck, 5, makeRng(2))
  assert.equal(a.length, 5)
  assert.notDeepEqual(a, b)
})

test('session scoring + lives', () => {
  let s = createSession({ mode: 'timeline', deckId: 'evo' })
  s = addScore(s, 3)
  assert.equal(s.score, 3)
  s = loseLife(s)
  assert.equal(s.lives, 2)
})
