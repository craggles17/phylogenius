// Peer-to-peer live voting room helpers. Pure helpers are exported for testing;
// network wiring (hostRoom, joinRoom) is thin and not unit-tested.

import { makeRng } from './data.js'

// Generate a short, URL-safe room ID with >=40 bits entropy. Pure given rng.
export function makeRoomId(rng) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no confusing 0/O, 1/I
    let id = ''
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(rng() * chars.length)]
    }
    return `phylo-${id}`
}

// Extract room ID from a location.search string, or null if absent.
export function roomIdFromSearch(search) {
    const params = new URLSearchParams(search)
    return params.get('room')
}

// Build a shareable room link.
export function roomLink(origin, pathname, roomId) {
    const url = new URL(pathname, origin)
    url.searchParams.set('room', roomId)
    return url.href
}

// Tally votes: input is an object/Map voterId->cardId (last write wins),
// output is an object cardId->count.
export function tallyVotes(votesByVoter) {
    const tally = {}
    for (const cardId of Object.values(votesByVoter)) {
        tally[cardId] = (tally[cardId] || 0) + 1
    }
    return tally
}

// Check if all expected voters have voted. Pure.
export function allVotesIn(votesByVoter, expectedCount) {
    return Object.keys(votesByVoter).length >= expectedCount
}

// Check if reveal should happen: all connected voters AND the host must have voted.
// The host is ALWAYS a participant and can vote via '__host__' key.
// Pure helper.
export function shouldReveal(votesByVoter, connectedVoterCount) {
    return Object.keys(votesByVoter).length >= connectedVoterCount + 1
}

// Extract unique clade emojis from a deck's cards.
// Clade fields may be composite multi-emoji strings (e.g. "🐟🦎", "🦑🐟🌿").
// Returns array of unique SINGLE emoji glyphs, sorted for determinism.
export function extractClades(deck) {
    const clades = new Set()
    for (const card of deck.cards) {
        if (card.clade) {
            // Split composite clade into individual emoji glyphs
            for (const emoji of Array.from(card.clade)) {
                clades.add(emoji)
            }
        }
    }
    return Array.from(clades).sort()
}

// Assign random clade emoji to each voter. Pure given rng and voterIds order.
// Returns a Map voterId->emoji.
export function assignCladeEmojis(voterIds, clades, rng) {
    const assignments = new Map()
    for (const voterId of voterIds) {
        const emoji = clades[Math.floor(rng() * clades.length)]
        assignments.set(voterId, emoji)
    }
    return assignments
}

// Update scoreboard: increment score for voters who voted for winnerCardId.
// Returns new scores object (does not mutate input).
export function updateScores(scores, votesByVoter, winnerCardId) {
    const next = { ...scores }
    for (const [voterId, cardId] of Object.entries(votesByVoter)) {
        if (cardId === winnerCardId) {
            next[voterId] = (next[voterId] || 0) + 1
        } else if (!(voterId in next)) {
            next[voterId] = 0
        }
    }
    return next
}

// Build sorted scoreboard entries: [{voterId, emoji, score}], descending by score.
export function buildScoreboard(scores, emojiMap) {
    return Object.entries(scores)
        .map(([voterId, score]) => ({
            voterId,
            emoji: emojiMap.get(voterId) || '❓',
            score,
        }))
        .sort((a, b) => b.score - a.score)
}

// Host a room: creates a PeerJS hub, tracks voters, broadcasts messages.
// Returns Promise<hub> where hub has { broadcast(msg), voterCount(), close() }.
export async function hostRoom(roomId, { onVoterCountChange, onVote, onVoterJoin, onVoterLeave }) {
    const peerModule = await import('https://esm.sh/peerjs@1.5.4')
    const Peer = peerModule.default ?? peerModule.Peer
    const peer = new Peer(roomId)
    const connections = new Map()
    let hub = null

    return new Promise((resolve, reject) => {
        peer.on('error', (err) => {
            if (err.type === 'unavailable-id') {
                reject(new Error(`Room ID "${roomId}" is already in use. Please try again.`))
            } else {
                reject(err)
            }
        })

        peer.on('connection', (conn) => {
            const voterId = conn.peer
            connections.set(voterId, conn)
            onVoterCountChange(connections.size)

            const sendToVoter = (msg) => {
                if (conn.open) conn.send(msg)
            }
            if (onVoterJoin) onVoterJoin(voterId, sendToVoter)

            conn.on('data', (msg) => {
                if (msg && msg.t === 'vote') onVote(voterId, msg)
            })

            conn.on('close', () => {
                connections.delete(voterId)
                onVoterCountChange(connections.size)
                if (onVoterLeave) onVoterLeave(voterId)
            })
        })

        peer.on('open', () => {
            hub = {
                broadcast(msg) {
                    for (const conn of connections.values()) {
                        if (conn.open) conn.send(msg)
                    }
                },
                voterCount() {
                    return connections.size
                },
                close() {
                    for (const conn of connections.values()) conn.close()
                    peer.destroy()
                },
            }
            resolve(hub)
        })
    })
}

// Join a room: connects to the host peer.
// Returns Promise<{ send(msg), close() }>.
export async function joinRoom(roomId, { onMessage, onError }) {
    const peerModule = await import('https://esm.sh/peerjs@1.5.4')
    const Peer = peerModule.default ?? peerModule.Peer
    const peer = new Peer()

    return new Promise((resolve, reject) => {
        peer.on('open', () => {
            const conn = peer.connect(roomId)

            conn.on('open', () => {
                resolve({
                    send(msg) {
                        if (conn.open) conn.send(msg)
                    },
                    close() {
                        conn.close()
                        peer.destroy()
                    },
                })
            })

            conn.on('data', (msg) => {
                onMessage(msg)
            })

            conn.on('error', (err) => {
                onError(err)
            })

            conn.on('close', () => {
                onError(new Error('Connection to host closed'))
            })
        })

        peer.on('error', (err) => {
            reject(err)
        })
    })
}
