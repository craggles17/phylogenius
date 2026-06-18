// Peer-to-peer live voting room helpers. Pure helpers are exported for testing;
// network wiring (hostRoom, joinRoom) is thin and not unit-tested.

import { makeRng } from './data.js'

// Generate a short, URL-safe room ID. Pure given rng.
export function makeRoomId(rng) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no confusing 0/O, 1/I
    let id = ''
    for (let i = 0; i < 5; i++) {
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

// Host a room: creates a PeerJS hub, tracks voters, broadcasts messages.
// Returns Promise<{ broadcast(msg), voterCount(), close() }>.
export async function hostRoom(roomId, { onVoterCountChange, onVote }) {
    const peerModule = await import('https://esm.sh/peerjs@1.5.4')
    const Peer = peerModule.default ?? peerModule.Peer
    const peer = new Peer(roomId)
    const connections = new Map()

    return new Promise((resolve, reject) => {
        peer.on('open', () => {
            const hub = {
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

            conn.on('data', (msg) => {
                if (msg && msg.t === 'vote') onVote(voterId, msg)
            })

            conn.on('close', () => {
                connections.delete(voterId)
                onVoterCountChange(connections.size)
            })
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
