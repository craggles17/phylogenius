// Extract card objects from parsed tables

import { extractTablesFromMarkdown, findCardTables } from './table-parser.js'
import { getColorForSuit, getEraColor } from '../utils/color-utils.js'

export function extractCardsFromMarkdown(markdown, deckType) {
  const tables = extractTablesFromMarkdown(markdown)
  const cardTables = findCardTables(tables)
  
  const cards = []
  for (const table of cardTables) {
    const suit = extractSuitFromTitle(table.title)
    for (const row of table.rows) {
      const card = buildCard(row, suit, deckType, table.title)
      if (card) cards.push(card)
    }
  }
  
  return cards
}

function extractSuitFromTitle(title) {
  // Title format: "🌀 Body Plan (16 cards)" or "Body Plan"
  const match = title.match(/^[^\w]*\s*(.+?)\s*\(?\d*\s*cards?\)?$/i)
  if (match) return match[1].trim()
  
  // Try extracting just the text part
  return title.replace(/[^\w\s]/g, '').trim().split(/\s+/).slice(0, 2).join(' ')
}

function buildCard(row, suit, deckType, tableTitle) {
  // Handle special cards differently
  if (tableTitle.toLowerCase().includes('special')) {
    return buildSpecialCard(row, deckType)
  }

  // Standard card for Cambrian/Evo decks (MYA-based)
  if (deckType === 'cambrian' || deckType === 'evo') {
    return buildTemporalCard(row, suit, deckType)
  }

  // Human genetics deck (frequency-based)
  if (deckType === 'human') {
    return buildGeneticsCard(row, suit)
  }

  return null
}

function buildTemporalCard(row, suit, deckType) {
  const id = row['_'] || row['number'] || ''
  const trait = row['trait'] || ''
  if (!trait) return null

  const mya = parseNumber(row['mya'])
  const era = row['era'] || ''
  const clade = row['clade'] || ''
  const prereq = row['prereq'] || ''
  const enables = row['enables'] || ''

  const colors = getColorForSuit(deckType, suit)
  const eraColor = getEraColor(era)

  return {
    id,
    type: 'temporal',
    deckType,
    trait,
    suit,
    mya,
    era,
    eraColor,
    clade,
    prereq,
    enables,
    colors,
    flavour: generateFlavour(trait, mya)
  }
}

function buildGeneticsCard(row, suit) {
  const id = row['_'] || row['number'] || ''
  const trait = row['trait'] || ''
  if (!trait) return null

  const gene = row['gene'] || ''
  const rsid = row['rsid'] || ''
  const globalPercent = parsePercent(row['global__'] || row['global_percent'] || '')
  const peak = row['peak_region'] || ''
  const effect = row['effect'] || ''
  const h2 = parseNumber(row['h_'] || row['h2'] || '0.5')

  const colors = getColorForSuit('human', suit)

  return {
    id,
    type: 'genetics',
    deckType: 'human',
    trait,
    suit,
    gene,
    rsid,
    globalPercent,
    peak,
    effect,
    h2,
    colors,
    flavour: generateGeneticsFlavour(trait, gene)
  }
}

function buildSpecialCard(row, deckType) {
  const id = row['_'] || row['number'] || ''
  const card = row['card'] || row['trait'] || ''
  const effect = row['effect'] || ''
  
  if (!card) return null

  const colors = getColorForSuit(deckType, 'Special')

  return {
    id,
    type: 'special',
    deckType,
    trait: card,
    suit: 'Special',
    effect,
    colors,
    isWild: effect.toLowerCase().includes('wild'),
    flavour: effect
  }
}

function parseNumber(str) {
  if (!str) return 0
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''))
  return isNaN(num) ? 0 : num
}

function parsePercent(str) {
  if (!str) return 0
  const match = str.match(/(\d+(?:\.\d+)?)\s*%?/)
  return match ? parseFloat(match[1]) : 0
}

function generateFlavour(trait, mya) {
  const flavours = {
    'Bilateral Symmetry': 'Left and right: the original design upgrade',
    'Multicellularity': 'Stronger together',
    'Jaws': 'Finally, a proper bite',
    'Eyes': 'The world snapped into focus',
    'Lungs': 'Taking the first breath of fresh air'
  }
  return flavours[trait] || `Evolved ${mya} million years ago`
}

function generateGeneticsFlavour(trait, gene) {
  const flavours = {
    'Lactase Persistent': 'Milk: not just for babies anymore',
    'Alcohol Flush': 'The Asian glow',
    'Red Hair': 'Kissed by fire',
    'Blue Eyes': 'A single mutation, 10,000 years ago'
  }
  return flavours[trait] || `Encoded by ${gene}`
}

export function groupCardsBySuit(cards) {
  const groups = {}
  for (const card of cards) {
    if (!groups[card.suit]) groups[card.suit] = []
    groups[card.suit].push(card)
  }
  return groups
}

export function sortCardsByValue(cards) {
  return [...cards].sort((a, b) => {
    if (a.mya !== undefined && b.mya !== undefined) {
      return b.mya - a.mya // Oldest first
    }
    if (a.globalPercent !== undefined && b.globalPercent !== undefined) {
      return a.globalPercent - b.globalPercent // Rarest first
    }
    return 0
  })
}

