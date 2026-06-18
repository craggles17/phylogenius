// Cladogram controller: drop cards onto a tree. The pure engine accepts a card
// only when its prereqs are already placed and it is later (smaller mya) than them.

import { renderCard } from '../ui/card.js'
import { enableDrag, makeDropZone } from '../ui/board.js'
import { drawPlayableHand, makeRng } from '../data.js'
import { canPlace, scoreCladogram, countBranches } from '../engine/cladogram.js'

const HAND_SIZE = 8

export default function start(root, deck, onScore) {
    // Guarantee a legal first move: an empty tree only accepts root-eligible cards.
    const canOpen = (card) => canPlace(card, {}, deck).ok
    const hand = drawPlayableHand(deck, HAND_SIZE, makeRng(Date.now() >>> 0), canOpen)
    const placedById = {}
    let total = 0

    const handEl = document.createElement('div')
    handEl.className = 'game__hand'
    const treeEl = document.createElement('div')
    treeEl.className = 'game__board'
    root.append(handEl, treeEl)

    function renderHand() {
        handEl.replaceChildren()
        for (const card of hand) {
            handEl.append(enableDrag(renderCard(card), { id: card.id }))
        }
    }

    function place(card) {
        const { ok } = canPlace(card, placedById, deck)
        if (!ok) return onScore(0, { life: true })
        placedById[card.id] = card
        hand.splice(hand.indexOf(card), 1)
        treeEl.append(renderCard(card))
        renderHand()
        // Engine score = 5/placement + 20 per connected branch >=5; emit the delta
        // so a completed branch awards its bonus exactly once.
        const placed = Object.keys(placedById).length
        const next = scoreCladogram({ placed, branches: countBranches(placedById) })
        onScore(next - total)
        total = next
    }

    makeDropZone(treeEl, (payload) => {
        const card = hand.find((c) => c.id === payload?.id)
        if (card) place(card)
    })

    renderHand()
}
