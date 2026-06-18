// Pure Memory Match rules: card-pair matching across three dimensions and scoring.
// No DOM access — importable in Node and the browser.

export const MATCH_CRITERIA = ['suit', 'valueBand', 'clade']

const MYA_BANDS = [
    [500, 'Ancient'],
    [200, 'Classic'],
    [50, 'Recent'],
    [0, 'Modern'],
]

const PERCENT_BANDS = [
    [1, 'Rare'],
    [10, 'Uncommon'],
    [30, 'Common'],
    [60, 'Frequent'],
    [Infinity, 'Universal'],
]

// MYA bands descend (older = bigger), so a value belongs to the first band it exceeds.
function bandAbove(value, bands) {
    const match = bands.find(([threshold]) => value > threshold)
    return (match || bands[bands.length - 1])[1]
}

// Percent bands ascend, so a value belongs to the first band it does not exceed.
function bandUpTo(value, bands) {
    const match = bands.find(([threshold]) => value <= threshold)
    return (match || bands[bands.length - 1])[1]
}

export function valueBand(card, deck) {
    if (deck.valueType === 'percent') {
        return bandUpTo(card.globalPercent, PERCENT_BANDS)
    }
    return bandAbove(card.mya, MYA_BANDS)
}

function sharesSymbol(a = '', b = '') {
    return [...a].some((sym) => b.includes(sym))
}

export function isMatch(a, b, criterion, deck) {
    if (criterion === 'valueBand') return valueBand(a, deck) === valueBand(b, deck)
    if (criterion === 'clade') return sharesSymbol(a.clade, b.clade)
    return a[criterion] === b[criterion]
}

export function scoreMemory({ pairs }) {
    return pairs * 5
}
