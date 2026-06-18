// Extract card objects from parsed tables

import { extractTablesFromMarkdown, findCardTables } from './table-parser.js'
import { getColorForSuit, getEraColor } from '../utils/color-utils.js'
import { resolvePrereqIds } from './trait-aliases.js'

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

  return resolveConnections(cards)
}

// Resolve free-text prereq/enables into card ids once the whole deck is known.
function resolveConnections(cards) {
  for (const card of cards) {
    card.prereqIds = resolvePrereqIds(card.prereq, cards, card.id)
    card.enableIds = resolvePrereqIds(card.enables, cards, card.id)
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
  const id = row[''] || row['_'] || row['number'] || ''
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
  const id = row[''] || row['_'] || row['number'] || ''
  const trait = row['trait'] || ''
  if (!trait) return null

  const gene = row['gene'] || ''
  const rsid = row['rsid'] || ''
  const globalPercent = parsePercent(row['global'] || row['global__'] || row['global_percent'] || '')
  const peak = row['peak_region'] || ''
  const effect = row['effect'] || ''
  const h2 = parseNumber(row['h'] || row['h_'] || row['h2'] || '0.5')

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
  const id = row[''] || row['_'] || row['number'] || ''
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
    // Evo deck traits
    'Bilateral Symmetry': 'Left and right: the original design upgrade',
    'Multicellularity': 'Stronger together',
    'Jaws': 'Finally, a proper bite',
    'Eyes': 'The world snapped into focus',
    'Lungs': 'Taking the first breath of fresh air',
    'Notochord': 'The flexible rod that gave vertebrates their backbone blueprint',
    'Vertebral Column': 'Segmented protection that built the vertebrate body plan',
    'Bony Skeleton': 'Calcium phosphate scaffolding that outlasts the soft parts',
    'Lobed Fins': 'The muscular paddles that became legs',
    'Four Limbs': 'The tetrapod toolkit for conquering land',
    'Digits (Fingers/Toes)': 'Evolution counted to five and stopped there',
    'Ribcage': 'A breathing cage that protects the vital organs',
    'Exoskeleton': 'Wearing your skeleton on the outside',
    'Shell (Turtle)': 'The slowest tank in nature',
    'Hollow Bones': 'Lightweight engineering for flight',
    'Antlers/Horns': 'Headgear for status and combat',
    'Opposable Thumb': 'The grasp that changed everything',
    'Feathers': 'Insulation first, flight later',
    'Hair/Fur': 'Warm-blooded insulation that mammals perfected',
    'Scales': 'Overlapping armor that keeps the moisture in',
    'Placenta': 'Internal nursery for developing young',
    'Live Birth': 'No eggs required for these babies',
    'Mammary Glands': 'The milk factory that defines mammals',
    'Venom': 'Chemical warfare refined over evolutionary time',
    'Amniotic Egg': 'A private pond for developing on land',
    'Wings': 'Flight evolved at least four separate times',
    // Cambrian deck traits
    'Prokaryotic Cell': 'Life began with these simple, nucleus-free pioneers',
    'Eukaryotic Cell': 'Complex cells born from ancient symbiosis',
    'Colonial Organisation': 'Working together before specialization',
    'Radial Symmetry': 'The body plan shaped like a wheel',
    'Body Cavity (Coelom)': 'Internal space where organs could develop',
    'Segmentation': 'Repeated body units built for flexibility',
    'Cephalisation': 'Brains concentrated in the front end',
    'Compound Eyes': 'Thousands of lenses in a single eye',
    'Calcified Shell': 'Hard protection made from ocean minerals',
    'Jointed Appendages': 'Articulated limbs that bend and grasp',
    'Gills': 'Breathing underwater through delicate filters',
    'Mouth': 'The opening that made predation possible',
    'Anus': 'Complete digestive tract with an exit',
    'Nerve Cord': 'Information highway down the body',
    'Heart': 'The pump that moved blood through the body',
    'Pharyngeal Slits': 'Gill slits that mark the chordate lineage',
    'Crystalline Lens': 'Focusing light with transparent protein',
    'Trilobite Eyes': 'Calcite lenses that fossilize perfectly',
    'Tail': 'Propulsion and balance in one appendage',
    'Spicules': 'Tiny mineral needles for structural support',
    'Filter Feeding': 'Harvesting tiny food from water currents',
    'Mineralized Teeth': 'Hard tools for biting and grinding',
    'Chitin Exoskeleton': 'The tough polymer that armored arthropods',
    'Mantle': 'The mollusc organ that builds shells',
    'Tube Feet': 'Hydraulic walking powered by water pressure'
  }
  return flavours[trait] || ''
}

function generateGeneticsFlavour(trait, gene) {
  const flavours = {
    'Lactase Persistent': 'Milk: not just for babies anymore',
    'Alcohol Flush': 'The Asian glow',
    'Red Hair': 'Kissed by fire',
    'Blue Eyes': 'A single founder mutation spread from the Black Sea',
    'Red-Green Colourblind': 'The most common color vision deficiency',
    'Tetrachromat': 'Four cone types instead of three',
    'Supertaster (PTC)': 'Bitter compounds taste intensely strong',
    'Non-taster (PTC)': 'Missing the bitter taste receptor',
    'Cilantro Soap': 'When herbs taste like dish detergent',
    'Asparagus Smell': 'The nose knows what you just ate',
    'Photic Sneeze (ACHOO)': 'Bright light triggers the sneeze reflex',
    'Perfect Pitch': 'The rare ability to identify any note instantly',
    'Wet Earwax': 'The sticky kind that requires cotton swabs',
    'Dry Earwax': 'The flaky kind that falls out on its own',
    'Freckles': 'Clustered melanin dots from sun exposure',
    'Dimples': 'A facial muscle variation that creates indents',
    'Widow\'s Peak': 'The V-shaped hairline pointing down',
    'Hitchhiker\'s Thumb': 'A thumb that bends backward at the joint',
    'Attached Earlobes': 'Earlobes that connect directly to the head',
    'Detached Earlobes': 'Earlobes that hang free',
    'Tongue Rolling': 'The ability to curl your tongue into a tube',
    'Cleft Chin': 'The dimple in the middle of the chin',
    'Hair Whorl': 'The spiral pattern where hair grows from the scalp',
    'Sneeze Count': 'Some people always sneeze twice or three times',
    'Morning Person': 'Natural circadian preference for early rising',
    'Night Owl': 'Genetic tendency toward late sleep schedules',
    'Caffeine Metabolism': 'How quickly your liver breaks down coffee',
    'Lactose Intolerant': 'The ancestral default after weaning',
    'Sickle Cell Trait': 'Malaria resistance with a trade-off',
    'Sprint Gene': 'Fast-twitch muscle fiber advantage'
  }
  return flavours[trait] || ''
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

