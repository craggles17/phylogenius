import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareByValue, isCorrectPlacement, scoreTimeline } from '../game/src/engine/timeline.js'

const mya = { valueType: 'mya' }
const pct = { valueType: 'percent' }
const A = { mya: 600 }, B = { mya: 480 }, C = { mya: 66 }

test('mya orders oldest→newest ascending', () => {
    assert.equal(compareByValue(A, B, mya), -1) // 600 older → before 480
    assert.equal(isCorrectPlacement(B, A, C, mya), true)
    assert.equal(isCorrectPlacement(C, A, B, mya), false)
})

test('percent orders rarest→common', () => {
    assert.equal(compareByValue({ globalPercent: 8 }, { globalPercent: 40 }, pct), -1)
})

test('score is correct count', () => assert.equal(scoreTimeline({ correct: 4, total: 5 }), 4))
