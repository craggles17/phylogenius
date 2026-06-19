// Unit tests for multiplayer.js pure helpers (no network/PeerJS).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    makeRoomId,
    roomIdFromSearch,
    roomLink,
    tallyVotes,
    allVotesIn,
    extractClades,
    assignCladeEmojis,
    updateScores,
    buildScoreboard,
    shouldReveal,
} from '../game/src/multiplayer.js'
import { makeRng } from '../game/src/data.js'

test('makeRoomId is deterministic and has correct format', () => {
    const rng1 = makeRng(42)
    const rng2 = makeRng(42)
    const id1 = makeRoomId(rng1)
    const id2 = makeRoomId(rng2)
    assert.equal(id1, id2, 'same seed should produce same room ID')
    assert.match(id1, /^phylo-[A-Z2-9]{8}$/, 'format should be phylo-XXXXX')
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

test('allVotesIn returns true when all votes received', () => {
    const votes = { voter1: 'cardA', voter2: 'cardB', voter3: 'cardA' }
    assert.equal(allVotesIn(votes, 3), true)
})

test('allVotesIn returns false when votes incomplete', () => {
    const votes = { voter1: 'cardA', voter2: 'cardB' }
    assert.equal(allVotesIn(votes, 3), false)
})

test('allVotesIn returns true when votes exceed expected (reconnect case)', () => {
    const votes = { voter1: 'cardA', voter2: 'cardB', voter3: 'cardA', voter4: 'cardB' }
    assert.equal(allVotesIn(votes, 3), true)
})

test('allVotesIn handles zero votes', () => {
    assert.equal(allVotesIn({}, 0), true)
    assert.equal(allVotesIn({}, 1), false)
})

test('extractClades returns unique sorted clades', () => {
    const deck = {
        cards: [
            { id: 'c1', clade: '🦠' },
            { id: 'c2', clade: '🐟' },
            { id: 'c3', clade: '🦠' },
            { id: 'c4', clade: '🦎' },
        ],
    }
    const clades = extractClades(deck)
    assert.deepEqual(clades, ['🐟', '🦎', '🦠'])
})

test('extractClades handles cards without clade field', () => {
    const deck = {
        cards: [
            { id: 'c1', clade: '🦠' },
            { id: 'c2' },
            { id: 'c3', clade: '🐟' },
        ],
    }
    const clades = extractClades(deck)
    assert.deepEqual(clades, ['🐟', '🦠'])
})

test('extractClades handles empty deck', () => {
    const deck = { cards: [] }
    assert.deepEqual(extractClades(deck), [])
})

test('extractClades splits composite clade strings into individual emojis', () => {
    const deck = {
        cards: [
            { id: 'c1', clade: '🦠' },
            { id: 'c2', clade: '🐟🦎' },
            { id: 'c3', clade: '🦑🐟🌿' },
            { id: 'c4', clade: '🦎🐁🐦🌿' },
        ],
    }
    const clades = extractClades(deck)
    // Should extract unique individual emojis
    assert.deepEqual(clades, ['🌿', '🐁', '🐟', '🐦', '🦎', '🦑', '🦠'])
})

test('extractClades handles mixed single and composite clades', () => {
    const deck = {
        cards: [
            { id: 'c1', clade: '🦠' },
            { id: 'c2', clade: '🦠🐟' },
            { id: 'c3', clade: '🐟' },
        ],
    }
    const clades = extractClades(deck)
    assert.deepEqual(clades, ['🐟', '🦠'])
})

test('assignCladeEmojis is deterministic given rng', () => {
    const clades = ['🦠', '🐟', '🦎']
    const voters = ['voter1', 'voter2', 'voter3']
    const rng1 = makeRng(42)
    const rng2 = makeRng(42)
    const map1 = assignCladeEmojis(voters, clades, rng1)
    const map2 = assignCladeEmojis(voters, clades, rng2)
    assert.deepEqual(Array.from(map1.entries()), Array.from(map2.entries()))
})

test('assignCladeEmojis assigns emoji to each voter', () => {
    const clades = ['🦠', '🐟']
    const voters = ['v1', 'v2']
    const rng = makeRng(1)
    const map = assignCladeEmojis(voters, clades, rng)
    assert.equal(map.size, 2)
    assert.ok(clades.includes(map.get('v1')))
    assert.ok(clades.includes(map.get('v2')))
})

test('updateScores increments score for correct voters', () => {
    const scores = { voter1: 2, voter2: 1 }
    const votes = { voter1: 'cardA', voter2: 'cardB', voter3: 'cardA' }
    const next = updateScores(scores, votes, 'cardA')
    assert.deepEqual(next, { voter1: 3, voter2: 1, voter3: 1 })
})

test('updateScores does not mutate input', () => {
    const scores = { voter1: 2 }
    const votes = { voter1: 'cardA' }
    const next = updateScores(scores, votes, 'cardA')
    assert.deepEqual(scores, { voter1: 2 })
    assert.deepEqual(next, { voter1: 3 })
})

test('updateScores initializes new voters with 0 on wrong vote', () => {
    const scores = {}
    const votes = { voter1: 'cardA', voter2: 'cardB' }
    const next = updateScores(scores, votes, 'cardA')
    assert.deepEqual(next, { voter1: 1, voter2: 0 })
})

test('updateScores handles all voters wrong', () => {
    const scores = { voter1: 2, voter2: 1 }
    const votes = { voter1: 'cardA', voter2: 'cardB' }
    const next = updateScores(scores, votes, 'cardC')
    assert.deepEqual(next, { voter1: 2, voter2: 1 })
})

test('buildScoreboard sorts by score descending', () => {
    const scores = { voter1: 2, voter2: 5, voter3: 3 }
    const emojiMap = new Map([
        ['voter1', '🦠'],
        ['voter2', '🐟'],
        ['voter3', '🦎'],
    ])
    const board = buildScoreboard(scores, emojiMap)
    assert.deepEqual(board, [
        { voterId: 'voter2', emoji: '🐟', score: 5 },
        { voterId: 'voter3', emoji: '🦎', score: 3 },
        { voterId: 'voter1', emoji: '🦠', score: 2 },
    ])
})

test('buildScoreboard uses fallback emoji for unknown voters', () => {
    const scores = { voter1: 2 }
    const emojiMap = new Map()
    const board = buildScoreboard(scores, emojiMap)
    assert.deepEqual(board, [{ voterId: 'voter1', emoji: '❓', score: 2 }])
})

test('buildScoreboard handles empty scores', () => {
    const board = buildScoreboard({}, new Map())
    assert.deepEqual(board, [])
})

test('shouldReveal returns true when all connected voters AND host have voted', () => {
    const votesByVoter = { voter1: 'cardA', voter2: 'cardB', '__host__': 'cardA' }
    assert.equal(shouldReveal(votesByVoter, 2), true, '2 voters + host = all in')
})

test('shouldReveal returns false when host has not voted yet', () => {
    const votesByVoter = { voter1: 'cardA', voter2: 'cardB' }
    assert.equal(shouldReveal(votesByVoter, 2), false, 'host vote missing')
})

test('shouldReveal returns false when some voters have not voted', () => {
    const votesByVoter = { voter1: 'cardA', '__host__': 'cardA' }
    assert.equal(shouldReveal(votesByVoter, 2), false, 'only 1 voter + host, need 2 voters')
})

test('shouldReveal returns true when host is the only participant (zero voters)', () => {
    const votesByVoter = { '__host__': 'cardA' }
    assert.equal(shouldReveal(votesByVoter, 0), true, 'host voted, zero voters = all in')
})

test('shouldReveal returns false when host has not voted and zero voters', () => {
    const votesByVoter = {}
    assert.equal(shouldReveal(votesByVoter, 0), false, 'host has not voted')
})

test('shouldReveal returns true when extra/reconnected voters voted', () => {
    const votesByVoter = { voter1: 'cardA', voter2: 'cardB', voter3: 'cardA', '__host__': 'cardB' }
    assert.equal(shouldReveal(votesByVoter, 2), true, '3 voters + host >= 2 voters + host')
})
