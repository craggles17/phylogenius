// Emit dist/game/cards.json and assemble a self-contained dist/game/ bundle.

import { readText, writeText, writeJson, ensureDir, resolveFromRoot } from '../utils/file-utils.js'
import { extractCardsFromMarkdown } from '../parsers/card-extractor.js'
import {
  CAMBRIAN_COLORS, HUMAN_COLORS, EVO_COLORS
} from '../utils/color-utils.js'
import { cp, access } from 'node:fs/promises'
import { join } from 'node:path'

const DECKS = {
  evo: {
    file: 'universal_evo_deck_1.md', title: 'Universal Evo',
    valueType: 'mya', hasPrereqs: true, colors: EVO_COLORS
  },
  cambrian: {
    file: 'cambrian_prehistory_deck.md', title: 'Cambrian Prehistory',
    valueType: 'mya', hasPrereqs: true, colors: CAMBRIAN_COLORS
  },
  human: {
    file: 'human_genetics_deck.md', title: 'Human Genetics',
    valueType: 'percent', hasPrereqs: false, colors: HUMAN_COLORS
  }
}

async function buildDeck(id, spec) {
  const markdown = await readText(resolveFromRoot(spec.file))
  // Drop special cards (extinction/wild): no usable mya/percent value, so they
  // would break timeline ordering (NaN) and pollute cladogram/memory buckets.
  const cards = extractCardsFromMarkdown(markdown, id).filter(c => c.type !== 'special')
  return {
    id, title: spec.title,
    valueType: spec.valueType,
    hasPrereqs: spec.hasPrereqs,
    suits: spec.colors,
    cards
  }
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

// Copy game/ source assets + shared styles into the self-contained bundle.
async function copyGameAssets(gameDistDir) {
  const gameSrc = resolveFromRoot('game')
  if (await exists(gameSrc)) {
    await cp(gameSrc, gameDistDir, { recursive: true })
  }
  const stylesDest = join(gameDistDir, 'styles')
  await ensureDir(stylesDest)
  const stylesSrc = resolveFromRoot('styles')
  for (const file of ['variables.css', 'card.css', 'game.css']) {
    const from = join(stylesSrc, file)
    if (await exists(from)) {
      await writeText(join(stylesDest, file), await readText(from))
    }
  }
}

export async function generateGameData() {
  const gameDistDir = resolveFromRoot('dist', 'game')
  await ensureDir(gameDistDir)

  const decks = {}
  const counts = {}
  for (const [id, spec] of Object.entries(DECKS)) {
    const deck = await buildDeck(id, spec)
    decks[id] = deck
    counts[id] = deck.cards.length
  }

  await copyGameAssets(gameDistDir)
  const out = join(gameDistDir, 'cards.json')
  await writeJson(out, { decks })

  return { written: out, counts }
}
