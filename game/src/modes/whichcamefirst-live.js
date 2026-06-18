// Live voting room controller: host starts rounds, voters vote, reveal shows tally.
// Reuses renderCard, drawClosePair, compareByValue from solo mode.

import { renderCard } from '../ui/card.js'
import { drawClosePair, makeRng } from '../data.js'
import { compareByValue } from '../engine/timeline.js'
import { makeRoomId, roomLink, tallyVotes, hostRoom, joinRoom } from '../multiplayer.js'

const PROMPT_TEXT = {
    mya: 'Which came first?',
    percent: 'Which is rarer?',
}

function el(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text != null) node.textContent = text
    return node
}

// Host a live game: create room, show share link, deal rounds, collect votes, reveal.
export async function hostLiveGame(root, deck, data) {
    const rng = makeRng(Date.now() >>> 0)
    const roomId = makeRoomId(rng)
    const shareUrl = roomLink(location.origin, location.pathname, roomId)

    const panel = el('div', 'live__panel')
    const linkLabel = el('p', 'live__label', 'Share this link with voters:')
    const linkBox = el('input', 'live__link')
    linkBox.value = shareUrl
    linkBox.readOnly = true
    linkBox.addEventListener('click', () => linkBox.select())

    const voterCount = el('p', 'live__voters', 'Voters: 0')
    const startBtn = el('button', 'game__btn', 'Start Round')
    const revealBtn = el('button', 'game__btn', 'Reveal')
    revealBtn.disabled = true

    panel.append(linkLabel, linkBox, voterCount, startBtn, revealBtn)

    const prompt = el('p', 'game__prompt', PROMPT_TEXT[deck.valueType] || 'Which came first?')
    const choices = el('div', 'game__choices')
    const tally = el('div', 'live__tally')

    root.append(panel, prompt, choices, tally)

    let hub
    try {
        hub = await hostRoom(roomId, {
            onVoterCountChange: (n) => {
                voterCount.textContent = `Voters: ${n}`
            },
            onVote: (voterId, msg) => {
                if (msg.round === currentRound) {
                    votesByVoter[voterId] = msg.cardId
                    renderTally()
                }
            },
        })
    } catch (err) {
        root.replaceChildren(el('p', 'live__error', `Failed to create room: ${err.message}`))
        return
    }

    let currentRound = 0
    let hand = []
    let votesByVoter = {}
    let hostVoted = false

    startBtn.addEventListener('click', () => {
        currentRound++
        hand = drawClosePair(deck, rng)
        votesByVoter = {}
        hostVoted = false
        renderRound()
        hub.broadcast({ t: 'round', round: currentRound, cardIds: hand.map((c) => c.id), prompt: prompt.textContent })
        startBtn.textContent = 'Next Round'
        revealBtn.disabled = false
    })

    revealBtn.addEventListener('click', () => {
        revealRound()
    })

    function renderRound() {
        choices.replaceChildren()
        tally.replaceChildren()
        for (const card of hand) {
            const cardEl = renderCard(card, { hideValue: true })
            cardEl.style.cursor = 'pointer'
            cardEl.addEventListener('click', () => {
                if (!hostVoted) {
                    votesByVoter['__host__'] = card.id
                    hostVoted = true
                    renderTally()
                }
            })
            choices.append(cardEl)
        }
    }

    function renderTally() {
        const counts = tallyVotes(votesByVoter)
        tally.replaceChildren()
        for (const card of hand) {
            const count = counts[card.id] || 0
            const bar = el('div', 'live__vote-bar')
            bar.textContent = `${card.trait}: ${count} vote${count !== 1 ? 's' : ''}`
            bar.style.width = `${Math.max(10, count * 20)}%`
            tally.append(bar)
        }
    }

    function revealRound() {
        const counts = tallyVotes(votesByVoter)
        const winnerCard = compareByValue(hand[0], hand[1], deck) <= 0 ? hand[0] : hand[1]

        hub.broadcast({ t: 'reveal', round: currentRound, winnerId: winnerCard.id, tally: counts })

        choices.replaceChildren()
        for (const card of hand) {
            const cardEl = renderCard(card)
            if (card.id === winnerCard.id) {
                cardEl.classList.add('card--winner')
                const label = el('div', 'card__winner-label')
                label.textContent = deck.valueType === 'percent' ? 'Rarer' : 'Came first'
                cardEl.append(label)
            } else {
                cardEl.classList.add('card--loser')
            }
            choices.append(cardEl)
        }

        renderTally()
        revealBtn.disabled = true
    }
}

// Join a live game: connect to host, render rounds, vote, see reveal.
export async function joinLiveGame(root, roomId, data) {
    const status = el('p', 'live__status', 'Connecting...')
    const prompt = el('p', 'game__prompt')
    const choices = el('div', 'game__choices')
    const tally = el('div', 'live__tally')

    root.append(status, prompt, choices, tally)

    let client
    try {
        client = await joinRoom(roomId, {
            onMessage: (msg) => {
                if (msg.t === 'round' || msg.t === 'state') {
                    handleRound(msg)
                } else if (msg.t === 'reveal') {
                    handleReveal(msg)
                }
            },
            onError: (err) => {
                status.textContent = `Connection error: ${err.message}`
            },
        })
        status.textContent = 'Connected! Waiting for host to start...'
    } catch (err) {
        root.replaceChildren(el('p', 'live__error', `Failed to join room: ${err.message}`))
        return
    }

    let currentRound = 0
    let voted = false

    function handleRound(msg) {
        currentRound = msg.round
        voted = false
        prompt.textContent = msg.prompt
        choices.replaceChildren()
        tally.replaceChildren()
        status.textContent = 'Vote for your answer:'

        for (const cardId of msg.cardIds) {
            const card = data.cards.find((c) => c.id === cardId)
            if (!card) continue
            const cardEl = renderCard(card, { hideValue: true })
            cardEl.style.cursor = 'pointer'
            cardEl.addEventListener('click', () => {
                if (!voted) {
                    client.send({ t: 'vote', round: currentRound, cardId: card.id })
                    voted = true
                    status.textContent = 'Vote submitted! Waiting for reveal...'
                }
            })
            choices.append(cardEl)
        }
    }

    function handleReveal(msg) {
        status.textContent = 'Revealed!'
        const cards = choices.querySelectorAll('.card')
        choices.replaceChildren()

        for (const cardEl of cards) {
            const cardId = cardEl.dataset.id
            const card = data.cards.find((c) => c.id === cardId)
            if (!card) continue

            const revealed = renderCard(card)
            if (card.id === msg.winnerId) {
                revealed.classList.add('card--winner')
                const label = el('div', 'card__winner-label', 'Correct!')
                revealed.append(label)
            } else {
                revealed.classList.add('card--loser')
            }
            choices.append(revealed)
        }

        tally.replaceChildren()
        for (const cardId in msg.tally) {
            const card = data.cards.find((c) => c.id === cardId)
            if (!card) continue
            const count = msg.tally[cardId]
            const bar = el('div', 'live__vote-bar')
            bar.textContent = `${card.trait}: ${count} vote${count !== 1 ? 's' : ''}`
            bar.style.width = `${Math.max(10, count * 20)}%`
            tally.append(bar)
        }
    }
}
