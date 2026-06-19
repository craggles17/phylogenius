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

    const scoreEl = Object.assign(document.createElement('span'), {
        className: 'game__score', textContent: `Score: ${session.score}`,
    })
    scoreEl.setAttribute('role', 'status')
    scoreEl.setAttribute('aria-live', 'polite')
    scoreEl.setAttribute('aria-atomic', 'true')

    const livesEl = Object.assign(document.createElement('span'), {
        className: 'game__lives', textContent: `Lives: ${session.lives}`,
    })
    livesEl.setAttribute('role', 'status')
    livesEl.setAttribute('aria-live', 'polite')
    livesEl.setAttribute('aria-atomic', 'true')

    el.append(menu, scoreEl, livesEl)
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
    // Bumped on every render so a previous session's pending timers (memory flip
    // resolve, which-came-first next-round) no-op after a Restart instead of scoring
    // into the fresh session.
    let generation = 0
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

    // Real restart: fresh session, same mode/deck, re-deal. (Previously both the
    // Restart button and the end-screen "Play Again" just returned to the menu.)
    function restart() {
        session = createSession({ mode: modeId, deckId: deck.id })
        ended = false
        render()
    }

    function render() {
        const gen = ++generation
        clearBoard(app)
        const barEl = bar(session, restart, toMenu)
        barEl.append(legendToggle)
        app.append(barEl)
        const playfield = document.createElement('div')
        playfield.className = 'game__play'
        app.append(playfield, legendPanel)
        start(playfield, deck, (delta, scoreOpts = {}) => {
            if (ended || gen !== generation) return
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
            const barEl = bar(session, restart, toMenu)
            barEl.append(legendToggle)
            old.replaceWith(barEl)
        }
    }

    function flashFeedback(type) {
        const barEl = app.querySelector('.game__bar')
        if (!barEl) return
        barEl.classList.add(`game__bar--${type}`)
        setTimeout(() => barEl.classList.remove(`game__bar--${type}`), 400)
        // Add audible announcement for screen readers (not color-only)
        const announcement = document.createElement('div')
        announcement.setAttribute('role', 'status')
        announcement.setAttribute('aria-live', 'polite')
        announcement.style.position = 'absolute'
        announcement.style.left = '-10000px'
        announcement.textContent = type === 'correct' ? 'Correct' : 'Incorrect'
        app.append(announcement)
        setTimeout(() => announcement.remove(), 1000)
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
        again.addEventListener('click', restart)
        const menuBtn = Object.assign(document.createElement('button'), {
            className: 'game__btn game__btn--back', textContent: '← Menu',
        })
        menuBtn.addEventListener('click', toMenu)
        overlay.append(title, score, again, menuBtn)
        app.append(overlay)

        // Move focus to overlay heading and trap focus within overlay
        setTimeout(() => {
            title.setAttribute('tabindex', '-1')
            title.focus()
            // Focus trap: Tab off the last button (menu) wraps to the title, and back.
            const trapFocus = (e) => {
                if (e.key === 'Tab' && e.target === menuBtn && !e.shiftKey) {
                    e.preventDefault()
                    title.focus()
                } else if (e.key === 'Tab' && e.target === title && e.shiftKey) {
                    e.preventDefault()
                    menuBtn.focus()
                }
            }
            overlay.addEventListener('keydown', trapFocus)
        }, 100)
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
