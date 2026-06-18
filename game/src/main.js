// Bootstrap: load cards.json, render the menu, route to the chosen mode, and own
// the session chrome (score, lives, Restart). DOM access is deferred to boot().

import { loadDecks, getDeck } from './data.js'
import { renderMenu } from './ui/menu.js'
import { clearBoard } from './ui/board.js'
import { createSession, addScore, loseLife } from './state.js'
import timeline from './modes/timeline.js'
import cladogram from './modes/cladogram.js'
import memory from './modes/memory.js'

const MODES = { timeline, cladogram, memory }

function bar(session, onRestart) {
    const el = document.createElement('div')
    el.className = 'game__bar'
    el.append(
        Object.assign(document.createElement('span'), {
            className: 'game__score', textContent: `Score: ${session.score}`,
        }),
        Object.assign(document.createElement('span'), {
            className: 'game__lives', textContent: `Lives: ${session.lives}`,
        }),
    )
    const restart = Object.assign(document.createElement('button'), {
        className: 'game__btn', textContent: 'Restart',
    })
    restart.addEventListener('click', onRestart)
    el.append(restart)
    return el
}

// Wire a mode's pure engine to the shared session chrome. Exported for testing.
export function routeMode(app, deck, modeId, toMenu) {
    let session = createSession({ mode: modeId, deckId: deck.id })
    const start = MODES[modeId]

    function render() {
        clearBoard(app)
        app.append(bar(session, toMenu))
        const playfield = document.createElement('div')
        playfield.className = 'game__play'
        app.append(playfield)
        start(playfield, deck, (delta, opts = {}) => {
            session = opts.life ? loseLife(session) : addScore(session, delta)
            update()
        })
    }

    function update() {
        const old = app.querySelector('.game__bar')
        if (old) old.replaceWith(bar(session, toMenu))
    }

    render()
}

export async function boot(app) {
    const data = await loadDecks('./cards.json')
    const decks = Object.values(data.decks)

    function showMenu() {
        clearBoard(app)
        app.append(renderMenu({
            decks,
            onStart: (modeId, deckId) =>
                routeMode(app, getDeck(data, deckId), modeId, showMenu),
        }))
    }

    showMenu()
}

if (typeof document !== 'undefined') {
    const app = document.getElementById('app')
    if (app) boot(app)
}
