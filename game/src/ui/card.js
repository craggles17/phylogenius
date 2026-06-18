// renderCard builds DOM mirroring templates/card.hbs so styles/card.css applies.

function el(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text != null) node.textContent = text
    return node
}

function dataRow(label, value, extra) {
    const row = el('div', 'card__row')
    row.append(el('span', 'card__label', label), el('span', 'card__value', value))
    if (extra) row.append(extra)
    return row
}

function dataSection(card, { hideValue = false } = {}) {
    const data = el('div', 'card__data')
    if (card.mya != null) {
        let era
        if (card.era) {
            era = el('span', 'card__era', hideValue ? '???' : card.era)
            if (!hideValue && card.eraColor) era.style.background = card.eraColor
        }
        data.append(dataRow('MYA:', hideValue ? '???' : String(card.mya), era))
    }
    if (card.globalPercent != null) {
        data.append(dataRow('Freq:', hideValue ? '???' : `${card.globalPercent}%`))
    }
    if (card.clade) data.append(dataRow('Clade:', card.clade))
    if (card.peak) data.append(dataRow('Peak:', card.peak))
    return data
}

export function renderCard(card, { faceDown = false, hideValue = false } = {}) {
    const type = card.type || 'standard'
    const article = el('article', `card card--${card.deckType || ''} card--${type}`)
    article.dataset.suit = card.suit || ''
    article.dataset.id = card.id || ''
    if (faceDown) {
        article.classList.add('card--back')
        article.append(el('span', 'card__icon', '?'))
        return article
    }

    const colors = card.colors || {}
    const header = el('header', 'card__header')
    const icon = el('span', 'card__icon', colors.icon || '')
    if (colors.primary) icon.style.color = colors.primary
    header.append(icon, el('h2', 'card__title', card.trait || ''), el('span', 'card__number', card.id || ''))

    const footer = el('footer', 'card__footer')
    footer.append(el('span', 'card__suit-name', card.suit || ''))
    if (colors.primary) footer.style.background = colors.primary

    article.append(header, dataSection(card, { hideValue }))
    if (card.flavour) article.append(el('blockquote', 'card__flavour', `"${card.flavour}"`))
    article.append(footer)
    return article
}
