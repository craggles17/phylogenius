// Pure timeline ordering + scoring. Importable in Node and browser (no DOM).
// mya decks order oldest→newest (compare by -mya so larger mya sorts earlier).
// percent decks order rarest→common (compare by globalPercent ascending).

function orderValue(card, deck) {
    return deck.valueType === 'mya' ? -card.mya : card.globalPercent
}

export function compareByValue(a, b, deck) {
    const va = orderValue(a, deck), vb = orderValue(b, deck)
    if (va < vb) return -1
    if (va > vb) return 1
    return 0
}

// A card is correctly placed between left and right when the sequence
// left → card → right is non-decreasing by order value.
export function isCorrectPlacement(card, leftCard, rightCard, deck) {
    if (leftCard && compareByValue(leftCard, card, deck) > 0) return false
    if (rightCard && compareByValue(card, rightCard, deck) > 0) return false
    return true
}

export function scoreTimeline({ correct }) {
    return correct
}
