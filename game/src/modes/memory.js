// Memory Match controller: a grid of face-down cards. Flip two; a pair scores when
// the pure engine matches them on the active criterion (suit by default).

import { renderCard } from '../ui/card.js'
import { drawHand, makeRng } from '../data.js'
import { isMatch } from '../engine/memory.js'

const PAIRS = 6
const PAIR_POINTS = 5
// Suit is the single match dimension for this solo session (intentional scope).
// The engine also supports 'valueBand' and 'clade' (engine/memory.js MATCH_CRITERIA)
// for a future criterion picker; suit keeps matches visually obvious on the board.
const CRITERION = 'suit'

function buildBoard(deck, rng) {
    const drawn = drawHand(deck, PAIRS, rng)
    const tiles = drawn.flatMap((card) => [{ ...card }, { ...card }])
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }
    return tiles
}

export default function start(root, deck, onScore) {
    const rng = makeRng(Date.now() >>> 0)
    const tiles = buildBoard(deck, rng)
    const grid = document.createElement('div')
    grid.className = 'game__board'
    root.append(grid)

    let flipped = []
    let locked = false

    function tileEl(card) {
        const el = renderCard(card, { faceDown: true })
        el.addEventListener('click', () => onFlip(el, card))
        return el
    }

    function reveal(el, card) {
        el.replaceWith(renderCard(card))
    }

    function resolve(a, b) {
        if (isMatch(a.card, b.card, CRITERION, deck)) {
            reveal(a.el, a.card)
            reveal(b.el, b.card)
            onScore(PAIR_POINTS)
        } else {
            onScore(0, { life: true })
            a.el.classList.remove('is-flipped')
            b.el.classList.remove('is-flipped')
            a.el.replaceWith(tileEl(a.card))
            b.el.replaceWith(tileEl(b.card))
        }
        flipped = []
        locked = false
    }

    function onFlip(el, card) {
        if (locked || el.classList.contains('is-flipped')) return
        el.classList.add('is-flipped')
        el.replaceWith(faceUpFront(card, el))
    }

    function faceUpFront(card, oldEl) {
        const front = renderCard(card)
        front.classList.add('is-flipped')
        flipped.push({ el: front, card })
        if (flipped.length === 2) {
            locked = true
            const [a, b] = flipped
            setTimeout(() => resolve(a, b), 600)
        }
        return front
    }

    for (const card of tiles) grid.append(tileEl(card))
}
