// Suit colours for each deck
export const CAMBRIAN_COLORS = {
  'Body Plan': { primary: '#1A237E', secondary: '#7986CB', icon: '🌀' },
  'Armour': { primary: '#607D8B', secondary: '#B0BEC5', icon: '🛡' },
  'Locomotion': { primary: '#00897B', secondary: '#4DB6AC', icon: '🌊' },
  'Feeding': { primary: '#C62828', secondary: '#EF5350', icon: '🦷' },
  'Respiration': { primary: '#03A9F4', secondary: '#81D4FA', icon: '💨' },
  'Reproduction': { primary: '#FF7043', secondary: '#FFAB91', icon: '🥚' },
  'Special': { primary: '#FFD700', secondary: '#FFF176', icon: '⚡' }
}

export const HUMAN_COLORS = {
  'Sensory': { primary: '#1E90FF', secondary: '#87CEEB', icon: '👁' },
  'Digestive': { primary: '#32CD32', secondary: '#90EE90', icon: '🍽' },
  'Metabolic': { primary: '#FF8C00', secondary: '#FFB347', icon: '⚡' },
  'Cosmetic': { primary: '#FF69B4', secondary: '#FFB6C1', icon: '✨' },
  'Behavioural': { primary: '#8B008B', secondary: '#DDA0DD', icon: '🧠' },
  'Immunity': { primary: '#DC143C', secondary: '#FF6B6B', icon: '🛡' },
  'Structural': { primary: '#708090', secondary: '#C0C0C0', icon: '🦴' },
  'Special': { primary: '#FFD700', secondary: '#FFFDD0', icon: '🎲' }
}

export const EVO_COLORS = {
  'Structural': { primary: '#F5F5DC', secondary: '#FFFAF0', icon: '🦴' },
  'Sensory': { primary: '#1E90FF', secondary: '#87CEEB', icon: '👁' },
  'Reproductive': { primary: '#FFB6C1', secondary: '#FFC0CB', icon: '🥚' },
  'Metabolic': { primary: '#FF8C00', secondary: '#FFB347', icon: '🔥' },
  'Neural': { primary: '#8B008B', secondary: '#DDA0DD', icon: '🧠' },
  'Special': { primary: '#FFD700', secondary: '#FFF176', icon: '⚡' }
}

export const ERA_COLORS = {
  'ARC': '#3D5A6C',
  'PRO': '#3D5A6C',
  'CAM': '#7CB342',
  'ORD': '#8BC34A',
  'SIL': '#9575CD',
  'DEV': '#795548',
  'CAR': '#546E7A',
  'PER': '#EF5350',
  'TRI': '#FF7043',
  'JUR': '#26A69A',
  'CRE': '#66BB6A',
  'PAL': '#FDD835',
  'NEO': '#FDD835',
  'QUA': '#D7CCC8'
}

export function getColorForSuit(deckType, suitName) {
  const colorMaps = {
    cambrian: CAMBRIAN_COLORS,
    human: HUMAN_COLORS,
    evo: EVO_COLORS
  }
  const colors = colorMaps[deckType] || {}
  return colors[suitName] || { primary: '#808080', secondary: '#C0C0C0', icon: '?' }
}

export function getEraColor(eraCode) {
  return ERA_COLORS[eraCode] || '#808080'
}

