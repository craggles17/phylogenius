// Bootstrap: load cards.json, render the menu, route to the chosen mode, and own
// the session chrome (score, lives, Restart). DOM access is deferred to boot().

import { loadDecks, getDeck } from './data.js'
import { renderMenu } from './ui/menu.js'
import { clearBoard } from './ui/board.js'
import { createSession, addScore, loseLife } from './state.js'
import { renderLegend, renderLegendToggle } from './ui/legend.js'
import timeline from './modes/timeline.js'
import cladogram from './modes/cladogram.js'
import memory from './modes/memory.js'
import whichcamefirst from './modes/whichcamefirst.js'
import { joinLiveGame } from './modes/whichcamefirst-live.js'
import { roomIdFromSearch } from './multiplayer.js'

const MODES = { timeline, cladogram, memory, whichcamefirst }

function bar(session, onRestart, onMenu) {
    const el = document.createElement('div')
    el.className = 'game__bar'
    const menu = Object.assign(document.createElement('button'), {
        className: 'game__btn game__btn--back', textContent: '← Menu',
    })
    menu.addEventListener('click', onMenu)
    el.append(
        menu,
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
export function routeMode(app, deck, modeId, toMenu, opts = {}) {
    let session = createSession({ mode: modeId, deckId: deck.id })
    let ended = false
    const start = MODES[modeId]

    let legendVisible = false
    const legendPanel = renderLegend()
    legendPanel.style.display = 'none'
    legendPanel.style.position = 'fixed'
    legendPanel.style.top = '60px'
    legendPanel.style.right = '10px'
    legendPanel.style.zIndex = '1000'

    const legendToggle = renderLegendToggle(() => {
        legendVisible = !legendVisible
        legendPanel.style.display = legendVisible ? 'block' : 'none'
        legendToggle.textContent = legendVisible ? '📖 Hide' : '📖'
    })

    function render() {
        clearBoard(app)
        const barEl = bar(session, () => { ended = true; toMenu() }, toMenu)
        barEl.append(legendToggle)
        app.append(barEl)
        const playfield = document.createElement('div')
        playfield.className = 'game__play'
        app.append(playfield, legendPanel)
        start(playfield, deck, (delta, scoreOpts = {}) => {
            if (ended) return
            const wasCorrect = delta > 0
            const wasWrong = scoreOpts.life
            session = scoreOpts.life ? loseLife(session) : addScore(session, delta)
            update()
            if (wasCorrect) flashFeedback('correct')
            if (wasWrong) flashFeedback('wrong')
            if (session.lives <= 0) endGame(false)
            else if (scoreOpts.win) endGame(true)
        }, opts)
    }

    function update() {
        const old = app.querySelector('.game__bar')
        if (old) {
            const barEl = bar(session, () => { ended = true; toMenu() }, toMenu)
            barEl.append(legendToggle)
            old.replaceWith(barEl)
        }
    }

    function flashFeedback(type) {
        const barEl = app.querySelector('.game__bar')
        if (!barEl) return
        barEl.classList.add(`game__bar--${type}`)
        setTimeout(() => barEl.classList.remove(`game__bar--${type}`), 400)
    }

    function endGame(won) {
        ended = true
        // Remove the playfield so any pending mode timers (reveal/next-round) render
        // into a detached node instead of leaking cards behind the end overlay.
        const playfield = app.querySelector('.game__play')
        if (playfield) playfield.remove()
        const overlay = document.createElement('div')
        overlay.className = 'game__end'
        const title = document.createElement('h2')
        title.className = 'game__end-title'
        title.textContent = won ? 'You Win!' : 'Game Over'
        const score = document.createElement('p')
        score.className = 'game__end-score'
        score.textContent = `Final Score: ${session.score}`
        const again = Object.assign(document.createElement('button'), {
            className: 'game__btn', textContent: 'Play Again',
        })
        again.addEventListener('click', toMenu)
        overlay.append(title, score, again)
        app.append(overlay)
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
            data,
            onStart: (modeId, deckId, opts) =>
                routeMode(app, getDeck(data, deckId), modeId, showMenu, opts),
            onMenu: showMenu,
        }))
    }

    // Check for direct mode/deck link ?mode=<id>&deck=<id>&difficulty=<level>
    const params = new URLSearchParams(location.search)
    const modeId = params.get('mode')
    const deckId = params.get('deck')
    const difficulty = params.get('difficulty')
    if (modeId && deckId && MODES[modeId] && data.decks[deckId]) {
        const opts = {}
        if (difficulty) {
            const { DIFFICULTY_WINDOWS } = await import('./data.js')
            const level = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
            if (DIFFICULTY_WINDOWS[level] !== undefined) {
                opts.window = DIFFICULTY_WINDOWS[level]
            }
        }
        routeMode(app, getDeck(data, deckId), modeId, showMenu, opts)
        return
    }

    // Check if joining a live room via ?room=<id>
    const roomId = roomIdFromSearch(location.search)
    if (roomId) {
        clearBoard(app)
        joinLiveGame(app, roomId, data, showMenu)
        return
    }

    showMenu()
}

if (typeof document !== 'undefined') {
    const app = document.getElementById('app')
    if (app) boot(app)
}
