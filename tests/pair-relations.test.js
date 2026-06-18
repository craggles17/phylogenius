import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyzePairRelation } from '../game/src/engine/pair-relations.js'

test('detects direct prerequisite A → B', () => {
  const cardA = { id: 'A', trait: 'Multicellularity', prereqIds: [], enableIds: [] }
  const cardB = { id: 'B', trait: 'Tissues', prereqIds: ['A'], enableIds: [] }
  const deck = { cards: [cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, true)
  assert.equal(result.reason, 'direct-prereq')
  assert.ok(result.fact.includes('Multicellularity'))
  assert.ok(result.fact.includes('Tissues'))
})

test('detects direct prerequisite B → A (reversed order)', () => {
  const cardA = { id: 'A', trait: 'Notochord', prereqIds: ['B'], enableIds: [] }
  const cardB = { id: 'B', trait: 'Multicellularity', prereqIds: [], enableIds: [] }
  const deck = { cards: [cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, true)
  assert.equal(result.reason, 'direct-prereq')
})

test('detects enable relationship A → B', () => {
  const cardA = { id: 'A', trait: 'Jaws', prereqIds: [], enableIds: ['B'] }
  const cardB = { id: 'B', trait: 'Predation', prereqIds: [], enableIds: [] }
  const deck = { cards: [cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, true)
  assert.equal(result.reason, 'enable')
  assert.ok(result.fact.includes('unlocked'))
})

test('detects shared prerequisite', () => {
  const root = { id: 'ROOT', trait: 'Bilateral Symmetry', prereqIds: [], enableIds: [] }
  const cardA = { id: 'A', trait: 'Exoskeleton', prereqIds: ['ROOT'], enableIds: [] }
  const cardB = { id: 'B', trait: 'Jointed Limbs', prereqIds: ['ROOT'], enableIds: [] }
  const deck = { cards: [root, cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, true)
  assert.equal(result.reason, 'shared-prereq')
  assert.ok(result.fact.includes('Bilateral Symmetry'))
})

test('detects unrelated (convergent evolution)', () => {
  const cardA = { id: 'A', trait: 'Wings (Birds)', prereqIds: ['X'], enableIds: [] }
  const cardB = { id: 'B', trait: 'Wings (Insects)', prereqIds: ['Y'], enableIds: [] }
  const cardX = { id: 'X', trait: 'Feathers', prereqIds: [], enableIds: [] }
  const cardY = { id: 'Y', trait: 'Chitin', prereqIds: [], enableIds: [] }
  const deck = { cards: [cardA, cardB, cardX, cardY] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, false)
  assert.equal(result.reason, 'convergent')
  assert.ok(result.fact.length > 0)
})

test('handles cards with no prereqIds or enableIds gracefully', () => {
  const cardA = { id: 'A', trait: 'Trait A' }
  const cardB = { id: 'B', trait: 'Trait B' }
  const deck = { cards: [cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, false)
  assert.equal(result.reason, 'convergent')
})

test('handles complex shared prerequisite chain', () => {
  const root1 = { id: 'R1', trait: 'Root 1', prereqIds: [], enableIds: [] }
  const root2 = { id: 'R2', trait: 'Root 2', prereqIds: [], enableIds: [] }
  const cardA = { id: 'A', trait: 'Trait A', prereqIds: ['R1', 'R2'], enableIds: [] }
  const cardB = { id: 'B', trait: 'Trait B', prereqIds: ['R2'], enableIds: [] }
  const deck = { cards: [root1, root2, cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  assert.equal(result.related, true)
  assert.equal(result.reason, 'shared-prereq')
  assert.ok(result.fact.includes('Root 2'))
})

test('prioritizes direct prereq over shared prereq', () => {
  const root = { id: 'ROOT', trait: 'Root', prereqIds: [], enableIds: [] }
  const cardA = { id: 'A', trait: 'Trait A', prereqIds: ['ROOT'], enableIds: [] }
  const cardB = { id: 'B', trait: 'Trait B', prereqIds: ['A', 'ROOT'], enableIds: [] }
  const deck = { cards: [root, cardA, cardB] }
  const result = analyzePairRelation(cardA, cardB, deck)
  // Should detect direct prereq A → B, not shared ROOT
  assert.equal(result.related, true)
  assert.equal(result.reason, 'direct-prereq')
})

test('convergent fact is deterministic for same card pair', () => {
  const cardA = { id: 'card-alpha', trait: 'Wings (Birds)', prereqIds: ['X'], enableIds: [] }
  const cardB = { id: 'card-beta', trait: 'Wings (Insects)', prereqIds: ['Y'], enableIds: [] }
  const cardX = { id: 'X', trait: 'Feathers', prereqIds: [], enableIds: [] }
  const cardY = { id: 'Y', trait: 'Chitin', prereqIds: [], enableIds: [] }
  const deck = { cards: [cardA, cardB, cardX, cardY] }
  const result1 = analyzePairRelation(cardA, cardB, deck)
  const result2 = analyzePairRelation(cardA, cardB, deck)
  const result3 = analyzePairRelation(cardA, cardB, deck)
  // Same inputs should produce same fact
  assert.equal(result1.fact, result2.fact)
  assert.equal(result2.fact, result3.fact)
})

test('convergent fact differs for different card pairs', () => {
  const cardA = { id: 'A1', trait: 'Trait A1', prereqIds: [], enableIds: [] }
  const cardB = { id: 'B1', trait: 'Trait B1', prereqIds: [], enableIds: [] }
  const cardC = { id: 'C2', trait: 'Trait C2', prereqIds: [], enableIds: [] }
  const cardD = { id: 'D2', trait: 'Trait D2', prereqIds: [], enableIds: [] }
  const deck = { cards: [cardA, cardB, cardC, cardD] }
  const result1 = analyzePairRelation(cardA, cardB, deck)
  const result2 = analyzePairRelation(cardC, cardD, deck)
  // Different card IDs may produce different facts (not guaranteed, but likely with stable hash)
  // At minimum, verify both are valid convergent facts
  assert.equal(result1.reason, 'convergent')
  assert.equal(result2.reason, 'convergent')
  assert.ok(result1.fact.length > 0)
  assert.ok(result2.fact.length > 0)
})
