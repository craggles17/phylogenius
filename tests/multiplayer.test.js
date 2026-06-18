// Unit tests for multiplayer.js pure helpers (no network/PeerJS).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeRoomId, roomIdFromSearch, roomLink, tallyVotes } from '../game/src/multiplayer.js'
import { makeRng } from '../game/src/data.js'

test('makeRoomId is deterministic and has correct format', () => {
    const rng1 = makeRng(42)
    const rng2 = makeRng(42)
    const id1 = makeRoomId(rng1)
    const id2 = makeRoomId(rng2)
    assert.equal(id1, id2, 'same seed should produce same room ID')
    assert.match(id1, /^phylo-[A-Z2-9]{5}$/, 'format should be phylo-XXXXX')
    const randomPart = id1.split('-')[1]
    assert.equal(/[01IOio]/.test(randomPart), false, 'random part should not contain confusing chars')
})

test('makeRoomId produces different IDs for different seeds', () => {
    const id1 = makeRoomId(makeRng(1))
    const id2 = makeRoomId(makeRng(2))
    assert.notEqual(id1, id2, 'different seeds should produce different IDs')
})

test('roomIdFromSearch extracts room param', () => {
    assert.equal(roomIdFromSearch('?room=phylo-ABC12'), 'phylo-ABC12')
    assert.equal(roomIdFromSearch('?foo=bar&room=phylo-XYZ99'), 'phylo-XYZ99')
    assert.equal(roomIdFromSearch('?room=phylo-ABC12&other=val'), 'phylo-ABC12')
})

test('roomIdFromSearch returns null when room param absent', () => {
    assert.equal(roomIdFromSearch(''), null)
    assert.equal(roomIdFromSearch('?foo=bar'), null)
    assert.equal(roomIdFromSearch('?'), null)
})

test('roomIdFromSearch handles multiple room params (takes first)', () => {
    // URLSearchParams.get returns the first value
    assert.equal(roomIdFromSearch('?room=first&room=second'), 'first')
})

test('roomLink constructs correct URL', () => {
    const url = roomLink('https://example.com', '/game/', 'phylo-TEST5')
    assert.equal(url, 'https://example.com/game/?room=phylo-TEST5')
})

test('roomLink handles pathname without trailing slash', () => {
    const url = roomLink('https://example.com', '/game', 'phylo-TEST5')
    assert.equal(url, 'https://example.com/game?room=phylo-TEST5')
})

test('tallyVotes counts votes per card', () => {
    const votes = { voter1: 'cardA', voter2: 'cardB', voter3: 'cardA' }
    const tally = tallyVotes(votes)
    assert.deepEqual(tally, { cardA: 2, cardB: 1 })
})

test('tallyVotes handles single voter', () => {
    const votes = { voter1: 'cardA' }
    const tally = tallyVotes(votes)
    assert.deepEqual(tally, { cardA: 1 })
})

test('tallyVotes handles empty votes', () => {
    const tally = tallyVotes({})
    assert.deepEqual(tally, {})
})

test('tallyVotes last-write-wins (Map iteration)', () => {
    // If a voterId appears multiple times in the object, only the last value counts
    // (though this is not typical use, since JS objects have unique keys)
    const votes = { voter1: 'cardA', voter2: 'cardB', voter1: 'cardC' }
    const tally = tallyVotes(votes)
    // voter1 -> 'cardC' (overwrites 'cardA')
    assert.deepEqual(tally, { cardC: 1, cardB: 1 })
})

test('tallyVotes handles all voters voting for same card', () => {
    const votes = { voter1: 'cardA', voter2: 'cardA', voter3: 'cardA' }
    const tally = tallyVotes(votes)
    assert.deepEqual(tally, { cardA: 3 })
})
