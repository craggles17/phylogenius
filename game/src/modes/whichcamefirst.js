// Which Came First controller: show two cards with hidden values, player clicks
// the one they think came first (or rarer for percent decks), reveal both, and
// score based on correctness. Correct → +1, wrong → lose a life.

import { renderCard } from '../ui/card.js'
import { drawClosePair, makeRng, getPairFact } from '../data.js'
import { compareByValue } from '../engine/timeline.js'
import { analyzePairRelation } from '../engine/pair-relations.js'
import { buildRelationIndicator } from '../ui/relation-indicator.js'

const PROMPT_TEXT = {
    mya: 'Which came first?',
    percent: 'Which is rarer?',
}
const ROUNDS = 10

export default function start(root, deck, onScore) {
    const rng = makeRng(Date.now() >>> 0)
    let hand = drawClosePair(deck, rng)
    let roundsCompleted = 0
    let ended = false

    const prompt = document.createElement('p')
    prompt.className = 'game__prompt'
    prompt.textContent = PROMPT_TEXT[deck.valueType] || 'Which came first?'

    const choices = document.createElement('div')
    choices.className = 'game__choices'

    const factBox = document.createElement('div')
    factBox.className = 'game__fact-box'
    factBox.style.display = 'none'

    root.append(prompt, choices, factBox)

    function nextRound() {
        if (ended) return
        hand = drawClosePair(deck, rng)
        renderChoices()
    }

    function renderChoices() {
        choices.replaceChildren()
        for (const card of hand) {
            const el = renderCard(card, { hideValue: true })
            el.style.cursor = 'pointer'
            el.addEventListener('click', () => onChoice(card))
            choices.append(el)
        }
    }

    function onChoice(picked) {
        if (ended) return
        const other = hand.find((c) => c !== picked)
        const cmp = compareByValue(picked, other, deck)
        const correct = cmp <= 0

        // Determine which card actually came first (or was rarer)
        const winnerCard = compareByValue(hand[0], hand[1], deck) <= 0 ? hand[0] : hand[1]
        const loserCard = hand[0] === winnerCard ? hand[1] : hand[0]

        // Show pair fact and relationship
        const pairFact = getPairFact(hand[0], hand[1], deck)
        const relation = analyzePairRelation(hand[0], hand[1], deck)

        choices.replaceChildren()

        // Build relationship indicator if related
        let relationIndicator = null
        if (relation.related) {
            relationIndicator = buildRelationIndicator(hand[0], hand[1], winnerCard, relation)
        }

        for (const card of hand) {
            const wrapper = document.createElement('div')
            wrapper.className = 'game__card-wrapper'

            const el = renderCard(card)
            if (card === winnerCard) {
                el.classList.add('card--winner')
                const label = document.createElement('div')
                label.className = 'card__winner-label'
                label.textContent = deck.valueType === 'percent' ? 'Rarer' : 'Came first'
                el.appendChild(label)
            } else {
                el.classList.add('card--loser')
            }
            wrapper.appendChild(el)

            // Insert relationship indicator between cards
            if (relationIndicator && card === hand[0]) {
                choices.append(wrapper, relationIndicator)
            } else {
                choices.append(wrapper)
            }
        }

        // Show fact box
        factBox.textContent = pairFact
        factBox.style.display = 'block'

        roundsCompleted++
        const isLastRound = roundsCompleted >= ROUNDS

        if (correct) {
            onScore(1, isLastRound ? { win: true } : {})
            if (isLastRound) {
                ended = true
                return
            }
        } else {
            onScore(0, { life: true })
        }

        setTimeout(() => {
            factBox.style.display = 'none'
            nextRound()
        }, 1200)
    }

    renderChoices()
}
