import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// Mode controllers + bootstrap. Modules must import in Node without DOM access at
// the top level; each mode default-exports start(root, deck, onScore). index.html
// must be self-contained: same-dir styles/ links and a ./cards.json fetch.

test('each mode default-exports a start function and imports cleanly in Node', async () => {
    for (const mode of ['timeline', 'cladogram', 'memory']) {
        const mod = await import(`../game/src/modes/${mode}.js`)
        assert.equal(typeof mod.default, 'function', `${mode} must default-export start`)
        assert.equal(mod.default.length, 3, `${mode} start(root, deck, onScore)`)
    }
})

test('main.js imports cleanly in Node (DOM-guarded) and routes modes', async () => {
    const main = await import('../game/src/main.js')
    assert.equal(typeof main.routeMode, 'function')
    const src = await readFile('game/src/main.js', 'utf8')
    for (const mode of ['timeline', 'cladogram', 'memory']) {
        assert.ok(src.includes(`modes/${mode}.js`), `main wires modes/${mode}.js`)
    }
    assert.ok(src.includes('loadDecks'), 'main loads decks')
    assert.ok(src.includes('renderMenu'), 'main renders the menu')
})

test('index.html is self-contained with relative styles and cards.json', async () => {
    const html = await readFile('game/index.html', 'utf8')
    assert.ok(/id=["']app["']/.test(html), 'single #app container')
    assert.ok(html.includes('type="module"'), 'main.js loaded as module')
    assert.ok(html.includes('src/main.js'), 'links src/main.js')
    for (const css of ['variables.css', 'card.css', 'game.css']) {
        assert.ok(html.includes(`styles/${css}`), `links styles/${css}`)
    }
    assert.ok(!html.includes('../styles/'), 'no parent-dir style paths (must be self-contained)')
})

test('cladogram mode scoring: 5-card chain gets +20 branch bonus', async () => {
    const { scoreCladogram, countBranches } = await import('../game/src/engine/cladogram.js')

    // Build a 5-card chain: C0 (root) → C1 → C2 → C3 → C4
    const chain = Array.from({ length: 5 }, (_, i) => ({
        id: `C${i}`,
        mya: 600 - i * 10,
        prereqIds: i === 0 ? [] : [`C${i - 1}`]
    }))

    const placed = Object.fromEntries(chain.map(c => [c.id, c]))
    const branches = countBranches(placed)
    const total = scoreCladogram({ placed: chain.length, branches })

    assert.equal(branches, 1, 'a 5-card chain counts as 1 branch')
    assert.equal(total, 5 * 5 + 1 * 20, 'score = 25 (5 placements) + 20 (branch) = 45')
})
