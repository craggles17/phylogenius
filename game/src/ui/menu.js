// Menu: deck picker + mode buttons. Cladogram disabled when !deck.hasPrereqs.

import { hostLiveGame } from '../modes/whichcamefirst-live.js'
import { renderLegend, renderLegendToggle } from './legend.js'
import { DIFFICULTY_WINDOWS } from '../data.js'

const MODES = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'cladogram', label: 'Cladogram Builder' },
    { id: 'memory', label: 'Memory Match' },
    { id: 'whichcamefirst', label: 'Which Came First' },
]

const COMPARISON_MODES = new Set(['timeline', 'whichcamefirst'])

function deckPicker(decks) {
    const select = document.createElement('select')
    select.className = 'menu__deck'
    for (const deck of decks) {
        const opt = document.createElement('option')
        opt.value = deck.id
        opt.textContent = deck.title || deck.id
        select.append(opt)
    }
    return select
}

function difficultyPicker() {
    const select = document.createElement('select')
    select.className = 'menu__difficulty'
    for (const level of Object.keys(DIFFICULTY_WINDOWS)) {
        const opt = document.createElement('option')
        opt.value = level
        opt.textContent = level
        if (level === 'Medium') opt.selected = true
        select.append(opt)
    }
    return select
}

function modeButton(mode, deck, onStart, difficulty) {
    const wrapper = document.createElement('div')
    wrapper.className = 'menu__mode-row'

    const btn = document.createElement('button')
    btn.className = 'menu__mode'
    btn.dataset.mode = mode.id
    btn.textContent = mode.label
    if (mode.id === 'cladogram' && deck.hasPrereqs === false) {
        btn.disabled = true
        btn.title = 'No prerequisites in this deck'
    } else {
        btn.addEventListener('click', () => onStart(mode.id, deck.id, difficulty))
    }

    const shareBtn = document.createElement('button')
    shareBtn.className = 'menu__share'
    shareBtn.textContent = '🔗'
    shareBtn.title = 'Copy link'
    shareBtn.addEventListener('click', () => {
        let url = `${location.origin}${location.pathname}?mode=${mode.id}&deck=${deck.id}`
        if (COMPARISON_MODES.has(mode.id) && difficulty !== 'Medium') {
            url += `&difficulty=${difficulty.toLowerCase()}`
        }
        navigator.clipboard.writeText(url).then(() => {
            shareBtn.textContent = '✓'
            setTimeout(() => { shareBtn.textContent = '🔗' }, 1000)
        })
    })

    wrapper.append(btn, shareBtn)
    return wrapper
}

export function renderMenu({ decks, data, onStart, onMenu }) {
    const root = document.createElement('div')
    root.className = 'menu'
    root.append(Object.assign(document.createElement('h1'), { className: 'menu__title', textContent: 'Phylogenius Puzzles' }))

    const deckSelect = deckPicker(decks)
    const difficultySelect = difficultyPicker()

    const deckLabel = document.createElement('label')
    deckLabel.className = 'menu__label'
    deckLabel.textContent = 'Deck:'
    deckLabel.append(deckSelect)

    const difficultyLabel = document.createElement('label')
    difficultyLabel.className = 'menu__label'
    difficultyLabel.textContent = 'Difficulty:'
    difficultyLabel.append(difficultySelect)

    root.append(deckLabel, difficultyLabel)

    const buttons = document.createElement('div')
    buttons.className = 'menu__modes'
    const byId = Object.fromEntries(decks.map((d) => [d.id, d]))

    let legendVisible = false
    const legendPanel = renderLegend()
    legendPanel.style.display = 'none'

    const legendToggle = renderLegendToggle(() => {
        legendVisible = !legendVisible
        legendPanel.style.display = legendVisible ? 'block' : 'none'
        legendToggle.textContent = legendVisible ? '📖 Hide Legend' : '📖 Legend'
    })

    function render() {
        buttons.replaceChildren()
        const deck = byId[deckSelect.value]
        const difficulty = difficultySelect.value
        const opts = { window: DIFFICULTY_WINDOWS[difficulty] }

        for (const mode of MODES) {
            buttons.append(modeButton(mode, deck, (modeId, deckId, diff) => {
                onStart(modeId, deckId, COMPARISON_MODES.has(modeId) ? opts : {})
            }, difficulty))
        }

        // Add "Host Live Vote" button
        const liveBtn = document.createElement('button')
        liveBtn.className = 'menu__mode menu__mode--live'
        liveBtn.textContent = 'Host Live Vote'
        liveBtn.addEventListener('click', () => {
            root.replaceChildren()
            hostLiveGame(root, deck, data, onMenu, opts)
        })
        buttons.append(liveBtn)
    }

    deckSelect.addEventListener('change', render)
    difficultySelect.addEventListener('change', render)
    render()
    root.append(buttons, legendToggle, legendPanel)
    return root
}
