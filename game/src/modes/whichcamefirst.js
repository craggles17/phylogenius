// Which Came First controller: show two cards with hidden values, player clicks
// the one they think came first (or rarer for percent decks), reveal both, and
// score based on correctness. Correct → +1, wrong → lose a life.

import { renderCard } from '../ui/card.js'
import { drawHand, makeRng } from '../data.js'
import { compareByValue } from '../engine/timeline.js'

const PROMPT_TEXT = {
    mya: 'Which came first?',
    percent: 'Which is rarer?',
}
const ROUNDS = 10

export default function start(root, deck, onScore) {
    const rng = makeRng(Date.now() >>> 0)
    let hand = drawHand(deck, 2, rng)
    let roundsCompleted = 0
    let ended = false

    const prompt = document.createElement('p')
    prompt.className = 'game__prompt'
    prompt.textContent = PROMPT_TEXT[deck.valueType] || 'Which came first?'

    const choices = document.createElement('div')
    choices.className = 'game__choices'

    root.append(prompt, choices)

    function nextRound() {
        if (ended) return
        hand = drawHand(deck, 2, rng)
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

        choices.replaceChildren()
        for (const card of hand) {
            choices.append(renderCard(card))
        }

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

        setTimeout(nextRound, 1200)
    }

    renderChoices()
}
