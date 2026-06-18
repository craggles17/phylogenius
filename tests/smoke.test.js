// Headless end-to-end smoke test. Refreshes dist/game, serves it over an ephemeral
// node:http server, then drives every (deck, mode) through one scoring move and a
// Restart with puppeteer. If Chromium genuinely cannot launch after a single install
// attempt, the suite SKIPS rather than hanging.

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { generateGameData } from '../scripts/generators/game-data.js'
import { staticHandler } from '../scripts/build.js'

const run = promisify(execFile)

// Reuse build.js#serve's request handler over dist/ on an ephemeral port (no drift).
function startServer() {
    const server = createServer(staticHandler(join(process.cwd(), 'dist')))
    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve(server))
    })
}

async function launch() {
    const { default: pp } = await import('puppeteer')
    const opts = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    try {
        return await pp.launch(opts)
    } catch {
        await run('npx', ['puppeteer', 'browsers', 'install', 'chrome'])
        return pp.launch(opts)
    }
}

// In-page: dispatch a synthetic drop carrying the card id, mimicking board.js's
// HTML5 dataTransfer payload (native drag-drop is unreliable under puppeteer).
function dropCard(page, zoneSelector, id) {
    return page.evaluate((sel, cardId) => {
        const zone = document.querySelector(sel)
        const dt = { getData: () => JSON.stringify({ id: cardId }), dropEffect: 'move' }
        const ev = new Event('drop', { bubbles: true, cancelable: true })
        Object.defineProperty(ev, 'dataTransfer', { value: dt })
        zone.dispatchEvent(ev)
    }, zoneSelector, id)
}

const scoreOf = (page) =>
    page.$eval('.game__score', (e) => Number(e.textContent.replace(/\D/g, '')))

const handIds = (page) =>
    page.$$eval('.game__hand .card', (els) => els.map((e) => e.dataset.id))

async function startMode(page, url, deckId, modeId) {
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.menu__deck')
    await page.select('.menu__deck', deckId)
    await page.click(`.menu__mode[data-mode="${modeId}"]`)
    await page.waitForSelector('.game__score')
}

// Drag modes: try each hand card until the engine accepts one (timeline accepts the
// first slot always; cladogram accepts any root-eligible card).
async function scoreDragMode(page, zone) {
    for (const id of await handIds(page)) {
        await dropCard(page, zone, id)
        if (await scoreOf(page) > 0) return
    }
    assert.fail('no hand card produced a valid placement')
}

// Memory: flip two face-down tiles sharing a suit, then await the resolve timeout.
async function scoreMemory(page) {
    const suit = await page.$$eval('.game__board .card', (els) => {
        const seen = {}
        for (const e of els) {
            const s = e.dataset.suit
            if (seen[s]) return s
            seen[s] = true
        }
        return null
    })
    assert.ok(suit, 'expected at least one matching suit pair')
    const tiles = await page.$$(`.game__board .card[data-suit="${suit}"]`)
    await tiles[0].click()
    await tiles[1].click()
    await page.waitForFunction(() => {
        const s = document.querySelector('.game__score')
        return s && Number(s.textContent.replace(/\D/g, '')) > 0
    }, { timeout: 4000 })
}

// Which Came First: read the two choice cards, look up their values in cards.json,
// compute the correct one using compareByValue, and click it.
async function scoreWhichCameFirst(page, deckId) {
    const { compareByValue } = await import('../game/src/engine/timeline.js')
    const { readFile } = await import('node:fs/promises')
    const cardsData = JSON.parse(await readFile('dist/game/cards.json', 'utf8'))
    const deck = cardsData.decks[deckId]

    const [id1, id2] = await page.$$eval('.game__play .card', (els) =>
        els.map((e) => e.dataset.id)
    )
    assert.ok(id1 && id2, 'expected two choice cards')
    assert.notEqual(id1, id2, 'expected distinct cards')

    const card1 = deck.cards.find((c) => c.id === id1)
    const card2 = deck.cards.find((c) => c.id === id2)
    assert.ok(card1 && card2, 'expected both cards in deck')

    const cmp = compareByValue(card1, card2, deck)
    const correctId = cmp <= 0 ? id1 : id2
    await page.click(`.game__play .card[data-id="${correctId}"]`)
}

// Timeline scores by dropping onto a slot; cladogram onto the whole tree board.
const DROP_ZONE = { timeline: '.game__slot', cladogram: '.game__board' }

const SCENARIOS = [
    ['evo', 'timeline'], ['evo', 'cladogram'], ['evo', 'memory'], ['evo', 'whichcamefirst'],
    ['cambrian', 'timeline'], ['cambrian', 'cladogram'], ['cambrian', 'memory'], ['cambrian', 'whichcamefirst'],
    ['human', 'timeline'], ['human', 'memory'], ['human', 'whichcamefirst'], // Cladogram skipped: human has no prereqs
]

let server
let browser
let baseUrl

before(async () => {
    await generateGameData()
    server = await startServer()
    baseUrl = `http://127.0.0.1:${server.address().port}/game/index.html`
    try {
        browser = await launch()
    } catch (err) {
        browser = null
        console.warn(`[smoke] skipping: Chromium unavailable - ${String(err).split('\n')[0]}`)
    }
})

after(async () => {
    if (browser) await browser.close()
    if (server) await new Promise((r) => server.close(r))
})

for (const [deckId, modeId] of SCENARIOS) {
    test(`${deckId}/${modeId}: scores a move and Restart resets`, async (t) => {
        if (!browser) return t.skip('Chromium could not launch in this environment')

        const page = await browser.newPage()
        try {
            await startMode(page, baseUrl, deckId, modeId)
            assert.equal(await scoreOf(page), 0, 'fresh session starts at 0')

            if (modeId === 'memory') await scoreMemory(page)
            else if (modeId === 'whichcamefirst') await scoreWhichCameFirst(page, deckId)
            else await scoreDragMode(page, DROP_ZONE[modeId])
            assert.ok(await scoreOf(page) > 0, 'visible score updates after a valid move')

            await page.click('.game__btn') // Restart returns to a fresh menu
            await page.waitForSelector('.menu__deck')
            assert.equal(await page.$('.game__score'), null, 'score bar cleared on reset')

            await startMode(page, baseUrl, deckId, modeId)
            assert.equal(await scoreOf(page), 0, 'restarted session is back to 0')
        } finally {
            await page.close()
        }
    })
}

test('human/whichcamefirst: game over after 3 wrong choices', async (t) => {
    if (!browser) return t.skip('Chromium could not launch in this environment')

    const page = await browser.newPage()
    try {
        await startMode(page, baseUrl, 'human', 'whichcamefirst')
        const { compareByValue } = await import('../game/src/engine/timeline.js')
        const { readFile } = await import('node:fs/promises')
        const cardsData = JSON.parse(await readFile('dist/game/cards.json', 'utf8'))
        const deck = cardsData.decks.human

        for (let i = 0; i < 3; i++) {
            const [id1, id2] = await page.$$eval('.game__play .card', (els) =>
                els.map((e) => e.dataset.id)
            )
            const card1 = deck.cards.find((c) => c.id === id1)
            const card2 = deck.cards.find((c) => c.id === id2)
            const cmp = compareByValue(card1, card2, deck)
            const wrongId = cmp <= 0 ? id2 : id1
            await page.click(`.game__play .card[data-id="${wrongId}"]`)
            await new Promise((r) => setTimeout(r, 1300))
        }

        await page.waitForSelector('.game__end', { timeout: 2000 })
        const endText = await page.$eval('.game__end', (e) => e.textContent)
        assert.ok(endText.includes('Game Over'), 'expected Game Over overlay')
    } finally {
        await page.close()
    }
})
