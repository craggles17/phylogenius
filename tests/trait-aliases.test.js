import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePrereqIds } from '../scripts/parsers/trait-aliases.js'

// Regression: token-subset matching used to resolve a card's prereq to ITSELF.
// Evo M08 "Four-Chambered Heart" has prereq "Heart" with no "Heart" card, so
// {heart} ⊆ {four,chambered,heart} matched M08, making it permanently unplaceable.
test('a card never resolves a prereq to its own id', () => {
  const cards = [{ id: 'M08', trait: 'Four-Chambered Heart' }]
  assert.deepEqual(resolvePrereqIds('Heart', cards, 'M08'), [])
})

test('self-exclusion still resolves a genuine other-card prereq', () => {
  const cards = [
    { id: 'S04', trait: 'Notochord' },
    { id: 'S05', trait: 'Vertebral Column' },
  ]
  assert.deepEqual(resolvePrereqIds('Notochord', cards, 'S05'), ['S04'])
})
