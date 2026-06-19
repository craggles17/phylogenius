// Timeline controller: draw a hand, drop cards onto an ordered row. Each drop is
// scored by the pure engine; correct placements add a point, wrong ones cost a life.

import { renderCard } from '../ui/card.js'
import { enableDrag, makeDropZone } from '../ui/board.js'
import { drawHand, drawCloseHand, makeRng, DIFFICULTY_WINDOWS } from '../data.js'
import { isCorrectPlacement, compareByValue } from '../engine/timeline.js'

const HAND_SIZE = 6

function neighbours(placed, index) {
    return [placed[index - 1] || null, placed[index] || null]
}

export default function start(root, deck, onScore, opts = {}) {
    const window = opts.window !== undefined ? opts.window : DIFFICULTY_WINDOWS.Medium
    const hand = drawCloseHand(deck, HAND_SIZE, makeRng(Date.now() >>> 0), window)
    const placed = []

    const handEl = document.createElement('div')
    handEl.className = 'game__hand'
    const boardEl = document.createElement('div')
    boardEl.className = 'game__board'
    root.append(handEl, boardEl)

    function renderHand() {
        handEl.replaceChildren()
        for (const card of hand) {
            // Hide the value in hand so ordering is a real puzzle; placing reveals it.
            const el = enableDrag(renderCard(card, { hideValue: true }), { id: card.id })
            el.setAttribute('role', 'button')
            el.setAttribute('aria-label', `${card.trait}: pick up, then tap a slot to place`)
            handEl.append(el)
        }
    }

    function insertAt(card, index) {
        const [left, right] = neighbours(placed, index)
        const ok = isCorrectPlacement(card, left, right, deck)
        if (!ok) return onScore(0, { life: true })
        placed.splice(index, 0, card)
        placed.sort((a, b) => compareByValue(a, b, deck))
        hand.splice(hand.indexOf(card), 1)
        renderHand()
        renderBoard()
        onScore(1, hand.length === 0 ? { win: true } : {})
    }

    function slot(index, hint) {
        const zone = document.createElement('div')
        zone.className = 'game__slot'
        zone.setAttribute('role', 'button')
        zone.setAttribute('aria-label', 'Place the selected card in this slot')
        if (hint) {
            zone.append(Object.assign(document.createElement('span'), {
                className: 'game__slot-hint', textContent: hint,
            }))
        }
        makeDropZone(zone, (payload) => {
            const card = hand.find((c) => c.id === payload?.id)
            if (card) insertAt(card, index)
        })
        return zone
    }

    function renderBoard() {
        boardEl.replaceChildren()
        const empty = placed.length === 0
        boardEl.append(slot(0, empty ? 'Tap a card, then tap here' : '+'))
        placed.forEach((card, i) => {
            // Placed cards are revealed (value shown) so the order becomes legible.
            boardEl.append(renderCard(card), slot(i + 1, '+'))
        })
    }

    renderHand()
    renderBoard()
}
