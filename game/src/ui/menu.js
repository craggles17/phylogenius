// Menu: deck picker + mode buttons. Cladogram disabled when !deck.hasPrereqs.

import { hostLiveGame } from '../modes/whichcamefirst-live.js'
import { renderLegend, renderLegendToggle } from './legend.js'

const MODES = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'cladogram', label: 'Cladogram Builder' },
    { id: 'memory', label: 'Memory Match' },
    { id: 'whichcamefirst', label: 'Which Came First' },
]

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

function modeButton(mode, deck, onStart) {
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
        btn.addEventListener('click', () => onStart(mode.id, deck.id))
    }

    const shareBtn = document.createElement('button')
    shareBtn.className = 'menu__share'
    shareBtn.textContent = '🔗'
    shareBtn.title = 'Copy link'
    shareBtn.addEventListener('click', () => {
        const url = `${location.origin}${location.pathname}?mode=${mode.id}&deck=${deck.id}`
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

    const select = deckPicker(decks)
    root.append(select)

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
        const deck = byId[select.value]
        for (const mode of MODES) buttons.append(modeButton(mode, deck, onStart))

        // Add "Host Live Vote" button
        const liveBtn = document.createElement('button')
        liveBtn.className = 'menu__mode menu__mode--live'
        liveBtn.textContent = 'Host Live Vote'
        liveBtn.addEventListener('click', () => {
            root.replaceChildren()
            hostLiveGame(root, deck, data, onMenu)
        })
        buttons.append(liveBtn)
    }

    select.addEventListener('change', render)
    render()
    root.append(buttons, legendToggle, legendPanel)
    return root
}
