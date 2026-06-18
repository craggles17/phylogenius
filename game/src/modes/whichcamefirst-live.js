// Live voting room controller: host starts rounds, voters vote, reveal shows tally.
// Reuses renderCard, drawClosePair, compareByValue from solo mode.

import { renderCard } from '../ui/card.js'
import { drawClosePair, makeRng, getPairFact } from '../data.js'
import { compareByValue } from '../engine/timeline.js'
import { analyzePairRelation } from '../engine/pair-relations.js'
import {
    makeRoomId,
    roomLink,
    tallyVotes,
    allVotesIn,
    extractClades,
    assignCladeEmojis,
    updateScores,
    buildScoreboard,
    shouldReveal,
    hostRoom,
    joinRoom,
} from '../multiplayer.js'
import { buildRelationIndicator } from '../ui/relation-indicator.js'

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
export async function hostLiveGame(root, deck, data, onMenu) {
    const rng = makeRng(Date.now() >>> 0)
    const roomId = makeRoomId(rng)
    const shareUrl = roomLink(location.origin, location.pathname, roomId)

    const panel = el('div', 'live__panel')
    const backBtn = el('button', 'game__btn game__btn--back', '← Menu')
    if (onMenu) backBtn.addEventListener('click', onMenu)
    const linkLabel = el('p', 'live__label', 'Share this link with voters:')
    const linkBox = el('input', 'live__link')
    linkBox.value = shareUrl
    linkBox.readOnly = true
    linkBox.addEventListener('click', () => linkBox.select())

    const voterList = el('div', 'live__voters')
    const startBtn = el('button', 'game__btn', 'Start Round')
    const revealBtn = el('button', 'game__btn', 'Reveal')
    revealBtn.disabled = true
    const nextBtn = el('button', 'game__btn', 'Next Round')
    nextBtn.disabled = true
    nextBtn.style.display = 'none'

    panel.append(backBtn, linkLabel, linkBox, voterList, startBtn, revealBtn, nextBtn)

    const prompt = el('p', 'game__prompt', PROMPT_TEXT[deck.valueType] || 'Which came first?')
    const choices = el('div', 'game__choices')
    const tally = el('div', 'live__tally')
    const factBox = el('div', 'game__fact-box')
    factBox.style.display = 'none'
    const scoreboard = el('div', 'live__scoreboard')

    root.append(panel, prompt, choices, tally, factBox, scoreboard)

    const clades = extractClades(deck)
    const voterEmojis = new Map()
    const connectedVoters = new Set()
    let scores = {}

    let hub
    try {
        hub = await hostRoom(roomId, {
            onVoterCountChange: (n) => {
                updateVoterList()
            },
            onVote: (voterId, msg) => {
                if (msg.round === currentRound) {
                    votesByVoter[voterId] = msg.cardId
                    renderTally()
                    if (shouldReveal(votesByVoter, connectedVoters.size)) {
                        revealBtn.disabled = false
                    }
                }
            },
            onVoterJoin: (voterId, sendToVoter) => {
                if (!connectedVoters.has(voterId)) {
                    connectedVoters.add(voterId)
                    if (!voterEmojis.has(voterId)) {
                        const emoji = clades[Math.floor(rng() * clades.length)]
                        voterEmojis.set(voterId, emoji)
                    }
                    if (!(voterId in scores)) {
                        scores[voterId] = 0
                    }
                    updateVoterList()

                    // If a round is in progress, sync the late joiner
                    if (currentRound > 0 && hand.length > 0) {
                        sendToVoter({
                            t: 'state',
                            round: currentRound,
                            deckId: deck.id,
                            cardIds: hand.map((c) => c.id),
                            prompt: prompt.textContent,
                        })
                    }
                }
            },
            onVoterLeave: (voterId) => {
                connectedVoters.delete(voterId)
                updateVoterList()
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

    function updateVoterList() {
        voterList.replaceChildren()
        const title = el('p', 'live__voters-title', `Voters (${connectedVoters.size}):`)
        voterList.append(title)
        for (const voterId of connectedVoters) {
            const emoji = voterEmojis.get(voterId) || '❓'
            const item = el('div', 'live__voter-item', `${emoji} ${voterId.slice(0, 8)}...`)
            voterList.append(item)
        }
    }

    startBtn.addEventListener('click', () => {
        currentRound++
        hand = drawClosePair(deck, rng)
        votesByVoter = {}
        hostVoted = false
        renderRound()
        hub.broadcast({ t: 'round', round: currentRound, deckId: deck.id, cardIds: hand.map((c) => c.id), prompt: prompt.textContent })
        startBtn.style.display = 'none'
        revealBtn.disabled = true
        nextBtn.style.display = 'none'
    })

    revealBtn.addEventListener('click', () => {
        revealRound()
    })

    nextBtn.addEventListener('click', () => {
        currentRound++
        hand = drawClosePair(deck, rng)
        votesByVoter = {}
        hostVoted = false
        factBox.style.display = 'none'
        renderRound()
        hub.broadcast({ t: 'round', round: currentRound, deckId: deck.id, cardIds: hand.map((c) => c.id), prompt: prompt.textContent })
        revealBtn.disabled = true
        nextBtn.style.display = 'none'
    })

    function renderRound() {
        choices.replaceChildren()
        tally.replaceChildren()
        for (const card of hand) {
            const wrapper = el('div', 'live__card-wrapper')
            const cardEl = renderCard(card, { hideValue: true })
            cardEl.style.cursor = 'pointer'
            cardEl.addEventListener('click', () => {
                if (!hostVoted) {
                    votesByVoter['__host__'] = card.id
                    hostVoted = true
                    renderTally()
                    if (shouldReveal(votesByVoter, connectedVoters.size)) {
                        revealBtn.disabled = false
                    }
                }
            })
            wrapper.append(cardEl)
            choices.append(wrapper)
        }
    }

    function renderTally() {
        const counts = tallyVotes(votesByVoter)
        tally.replaceChildren()
        for (const card of hand) {
            const votersForCard = Object.entries(votesByVoter)
                .filter(([_, cardId]) => cardId === card.id)
                .map(([voterId]) => voterId)
            const count = votersForCard.length

            const wrapper = el('div', 'live__card-wrapper')
            const cardEl = renderCard(card, { hideValue: true })
            cardEl.style.position = 'relative'

            const badges = el('div', 'live__vote-badges')
            for (const voterId of votersForCard) {
                const emoji = voterId === '__host__' ? '👑' : voterEmojis.get(voterId) || '❓'
                const badge = el('span', 'live__vote-badge', emoji)
                badges.append(badge)
            }
            cardEl.append(badges)

            const bar = el('div', 'live__vote-bar')
            bar.textContent = `${card.trait}: ${count} vote${count !== 1 ? 's' : ''}`
            bar.style.width = `${Math.max(10, count * 20)}%`

            wrapper.append(cardEl)
            tally.append(wrapper, bar)
        }
    }

    function revealRound() {
        const counts = tallyVotes(votesByVoter)
        const winnerCard = compareByValue(hand[0], hand[1], deck) <= 0 ? hand[0] : hand[1]

        scores = updateScores(scores, votesByVoter, winnerCard.id)

        // Get pair fact and relationship
        const pairFact = getPairFact(hand[0], hand[1], deck)
        const relation = analyzePairRelation(hand[0], hand[1], deck)

        const scoreboardData = buildScoreboard(scores, voterEmojis)
        hub.broadcast({
            t: 'reveal',
            round: currentRound,
            winnerId: winnerCard.id,
            tally: counts,
            scoreboard: scoreboardData,
            pairFact,
        })

        choices.replaceChildren()

        // Build relationship indicator if related
        let relationIndicator = null
        if (relation.related) {
            relationIndicator = buildRelationIndicator(hand[0], hand[1], winnerCard, relation)
        }

        for (const card of hand) {
            const votersForCard = Object.entries(votesByVoter)
                .filter(([_, cardId]) => cardId === card.id)
                .map(([voterId]) => voterId)

            const wrapper = el('div', 'live__card-wrapper')
            const cardEl = renderCard(card)
            if (card.id === winnerCard.id) {
                cardEl.classList.add('card--winner')
                const label = el('div', 'card__winner-label')
                label.textContent = deck.valueType === 'percent' ? 'Rarer' : 'Came first'
                cardEl.append(label)
            } else {
                cardEl.classList.add('card--loser')
            }

            const badges = el('div', 'live__vote-badges')
            for (const voterId of votersForCard) {
                const emoji = voterId === '__host__' ? '👑' : voterEmojis.get(voterId) || '❓'
                const badge = el('span', 'live__vote-badge', emoji)
                badges.append(badge)
            }
            cardEl.append(badges)

            wrapper.append(cardEl)

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

        renderScoreboard()
        tally.replaceChildren()
        revealBtn.disabled = true
        nextBtn.style.display = 'inline-block'
    }

    function renderScoreboard() {
        scoreboard.replaceChildren()
        const title = el('h3', 'live__scoreboard-title', '🏆 Scoreboard')
        scoreboard.append(title)

        const entries = buildScoreboard(scores, voterEmojis)
        for (const entry of entries) {
            const row = el('div', 'live__score-row')
            const name = entry.voterId === '__host__' ? 'Host 👑' : `${entry.emoji} ${entry.voterId.slice(0, 8)}...`
            row.textContent = `${name}: ${entry.score}`
            scoreboard.append(row)
        }
    }
}

// Join a live game: connect to host, render rounds, vote, see reveal.
export async function joinLiveGame(root, roomId, data, onMenu) {
    const backBtn = el('button', 'game__btn game__btn--back', '← Menu')
    if (onMenu) backBtn.addEventListener('click', onMenu)
    const status = el('p', 'live__status', 'Connecting...')
    const prompt = el('p', 'game__prompt')
    const choices = el('div', 'game__choices')
    const tally = el('div', 'live__tally')
    const factBox = el('div', 'game__fact-box')
    factBox.style.display = 'none'
    const scoreboard = el('div', 'live__scoreboard')

    root.append(backBtn, status, prompt, choices, tally, factBox, scoreboard)

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
    let currentDeckId = null
    let voted = false
    const deckCards = () => (currentDeckId && data.decks[currentDeckId]?.cards) || []

    function handleRound(msg) {
        currentRound = msg.round
        currentDeckId = msg.deckId
        voted = false
        prompt.textContent = msg.prompt
        choices.replaceChildren()
        tally.replaceChildren()
        factBox.style.display = 'none'

        // Guard: check if any card is missing from deck
        const missingCard = msg.cardIds.some((cardId) => !deckCards().find((c) => c.id === cardId))
        if (missingCard) {
            status.textContent = 'Deck out of sync with host'
            return
        }

        status.textContent = 'Vote for your answer:'

        for (const cardId of msg.cardIds) {
            const card = deckCards().find((c) => c.id === cardId)
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
            const card = deckCards().find((c) => c.id === cardId)
            if (!card) continue

            const wrapper = el('div', 'live__card-wrapper')
            const revealed = renderCard(card)
            if (card.id === msg.winnerId) {
                revealed.classList.add('card--winner')
                const label = el('div', 'card__winner-label', 'Correct!')
                revealed.append(label)
            } else {
                revealed.classList.add('card--loser')
            }
            wrapper.append(revealed)
            choices.append(wrapper)
        }

        tally.replaceChildren()

        // Show fact if provided
        if (msg.pairFact) {
            factBox.textContent = msg.pairFact
            factBox.style.display = 'block'
        }

        if (msg.scoreboard) {
            scoreboard.replaceChildren()
            const title = el('h3', 'live__scoreboard-title', '🏆 Scoreboard')
            scoreboard.append(title)
            for (const entry of msg.scoreboard) {
                const row = el('div', 'live__score-row')
                const name = entry.voterId === '__host__' ? 'Host 👑' : `${entry.emoji} ${entry.voterId.slice(0, 8)}...`
                row.textContent = `${name}: ${entry.score}`
                scoreboard.append(row)
            }
        }
    }
}
