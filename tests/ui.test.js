import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// UI primitives must import without throwing in Node (DOM-guarded) and the
// classes they emit must exist in styles/card.css so the print styles apply.

test('ui modules import without throwing in Node (no DOM access at top level)', async () => {
    const card = await import('../game/src/ui/card.js')
    const menu = await import('../game/src/ui/menu.js')
    const board = await import('../game/src/ui/board.js')
    assert.equal(typeof card.renderCard, 'function')
    assert.equal(typeof menu.renderMenu, 'function')
    assert.equal(typeof board.enableDrag, 'function')
    assert.equal(typeof board.makeDropZone, 'function')
    assert.equal(typeof board.clearBoard, 'function')
})

test('card.js mirrors card.hbs classes that styles/card.css defines', async () => {
    const css = await readFile('styles/card.css', 'utf8')
    const src = await readFile('game/src/ui/card.js', 'utf8')
    const classes = ['card', 'card__header', 'card__title', 'card__number', 'card__data', 'card__row', 'card__label', 'card__value', 'card__footer']
    for (const cls of classes) {
        assert.ok(css.includes(`.${cls}`), `card.css missing .${cls}`)
        assert.ok(src.includes(cls), `card.js does not emit ${cls}`)
    }
})

test('game.css reuses variables.css tokens', async () => {
    const css = await readFile('game/styles/game.css', 'utf8')
    assert.ok(css.includes('var(--'), 'game.css should reuse design tokens')
})
