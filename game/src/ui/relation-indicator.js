// Builds the visual relationship indicator (arrow/line) between two cards.
// Used in both solo and live Which Came First modes.

export function buildRelationIndicator(cardA, cardB, winnerCard, relation) {
    const indicator = document.createElement('div')
    indicator.className = 'game__relation-indicator'

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '80')
    svg.setAttribute('height', '40')
    svg.setAttribute('viewBox', '0 0 80 40')

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '10')
    line.setAttribute('y1', '20')
    line.setAttribute('x2', '70')
    line.setAttribute('y2', '20')
    line.setAttribute('stroke', '#666')
    line.setAttribute('stroke-width', '2')
    svg.appendChild(line)

    // Arrow direction based on winner and relationship type
    let arrowX = 70
    if (relation.reason === 'direct-prereq' || relation.reason === 'enable') {
        // Point toward the card that came after
        if (winnerCard === cardA) arrowX = 70
        else arrowX = 10
    }

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    if (arrowX === 70) {
        arrow.setAttribute('points', '70,20 65,15 65,25')
    } else {
        arrow.setAttribute('points', '10,20 15,15 15,25')
    }
    arrow.setAttribute('fill', '#666')
    svg.appendChild(arrow)

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', '40')
    label.setAttribute('y', '15')
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', '10')
    label.setAttribute('fill', '#666')
    label.textContent = relation.reason === 'enable' ? 'enables' : '→'
    svg.appendChild(label)

    indicator.appendChild(svg)
    return indicator
}
