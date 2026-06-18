// Menu: deck picker + 3 mode buttons. Cladogram disabled when !deck.hasPrereqs.

const MODES = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'cladogram', label: 'Cladogram Builder' },
    { id: 'memory', label: 'Memory Match' },
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
    return btn
}

export function renderMenu({ decks, onStart }) {
    const root = document.createElement('div')
    root.className = 'menu'
    root.append(Object.assign(document.createElement('h1'), { className: 'menu__title', textContent: 'Phylogenius Puzzles' }))

    const select = deckPicker(decks)
    root.append(select)

    const buttons = document.createElement('div')
    buttons.className = 'menu__modes'
    const byId = Object.fromEntries(decks.map((d) => [d.id, d]))

    function render() {
        buttons.replaceChildren()
        const deck = byId[select.value]
        for (const mode of MODES) buttons.append(modeButton(mode, deck, onStart))
    }

    select.addEventListener('change', render)
    render()
    root.append(buttons)
    return root
}
