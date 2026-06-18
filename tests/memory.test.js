import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    MATCH_CRITERIA,
    isMatch,
    valueBand,
    scoreMemory,
} from '../game/src/engine/memory.js'

const mya = { valueType: 'mya' }
const pct = { valueType: 'percent' }

test('MATCH_CRITERIA lists the three match dimensions', () => {
    assert.deepEqual(MATCH_CRITERIA, ['suit', 'valueBand', 'clade'])
})

test('suit match', () => {
    assert.equal(isMatch({ suit: 'Neural' }, { suit: 'Neural' }, 'suit', mya), true)
    assert.equal(isMatch({ suit: 'Neural' }, { suit: 'Bone' }, 'suit', mya), false)
})

test('valueBand buckets mya by era range', () => {
    assert.equal(valueBand({ mya: 600 }, mya), 'Ancient')
    assert.equal(valueBand({ mya: 500 }, mya), 'Classic')
    assert.equal(valueBand({ mya: 300 }, mya), 'Classic')
    assert.equal(valueBand({ mya: 120 }, mya), 'Recent')
    assert.equal(valueBand({ mya: 40 }, mya), 'Modern')
    assert.equal(isMatch({ mya: 600 }, { mya: 520 }, 'valueBand', mya), true)
    assert.equal(isMatch({ mya: 600 }, { mya: 300 }, 'valueBand', mya), false)
})

test('valueBand buckets percent by frequency', () => {
    assert.equal(valueBand({ globalPercent: 1 }, pct), 'Rare')
    assert.equal(valueBand({ globalPercent: 8 }, pct), 'Uncommon')
    assert.equal(valueBand({ globalPercent: 20 }, pct), 'Common')
    assert.equal(valueBand({ globalPercent: 50 }, pct), 'Frequent')
    assert.equal(valueBand({ globalPercent: 80 }, pct), 'Universal')
})

test('clade match on shared symbol', () => {
    assert.equal(isMatch({ clade: '🌿' }, { clade: '🐁🌿' }, 'clade', mya), true)
    assert.equal(isMatch({ clade: '🐟' }, { clade: '🐁🌿' }, 'clade', mya), false)
})

test('score is five per pair', () => {
    assert.equal(scoreMemory({ pairs: 3, moves: 8 }), 15)
})
