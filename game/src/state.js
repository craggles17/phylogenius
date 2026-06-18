// Session score/lives and best-score persistence (localStorage; Node-guarded).

const STARTING_LIVES = 3

export function createSession({ mode, deckId }) {
  return { mode, deckId, score: 0, lives: STARTING_LIVES }
}

export function addScore(session, n) {
  return { ...session, score: session.score + n }
}

export function loseLife(session) {
  return { ...session, lives: Math.max(0, session.lives - 1) }
}

function bestKey(mode, deckId) {
  return `phylogenius:best:${mode}:${deckId}`
}

export function bestScore(mode, deckId) {
  if (typeof localStorage === 'undefined') return 0
  return Number(localStorage.getItem(bestKey(mode, deckId))) || 0
}

export function saveBest(mode, deckId, score) {
  if (typeof localStorage === 'undefined') return score
  const best = Math.max(score, bestScore(mode, deckId))
  localStorage.setItem(bestKey(mode, deckId), String(best))
  return best
}
