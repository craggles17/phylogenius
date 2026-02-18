// Parse deck metadata from markdown files

import { extractTablesFromMarkdown } from './table-parser.js'

export function extractDeckMeta(markdown) {
  const lines = markdown.split('\n')
  const meta = {
    title: '',
    description: '',
    cardCount: 0,
    suits: [],
    eras: [],
    clades: []
  }

  // Extract title from first H1
  for (const line of lines) {
    if (line.startsWith('# ')) {
      meta.title = line.replace(/^#\s*/, '').trim()
      break
    }
  }

  // Extract description from Overview section
  const overviewMatch = markdown.match(/## Overview\s*\n([\s\S]*?)(?=\n##|\n---|\Z)/i)
  if (overviewMatch) {
    meta.description = overviewMatch[1].trim().split('\n')[0]
  }

  // Extract suits from Systems/Categories table
  const tables = extractTablesFromMarkdown(markdown)
  const suitsTable = tables.find(t => 
    t.title.toLowerCase().includes('system') || 
    t.title.toLowerCase().includes('categor')
  )
  
  if (suitsTable) {
    meta.suits = suitsTable.rows.map(row => ({
      name: row['system'] || row['category'] || '',
      icon: row['symbol'] || row['icon'] || '',
      color: row['colour'] || row['color'] || '',
      hex: row['hex'] || '',
      count: parseInt(row['cards'] || row['card_count'] || '0', 10)
    })).filter(s => s.name)

    meta.cardCount = meta.suits.reduce((sum, s) => sum + s.count, 0)
  }

  // Extract eras from Era Codes table
  const erasTable = tables.find(t => t.title.toLowerCase().includes('era'))
  if (erasTable) {
    meta.eras = erasTable.rows.map(row => ({
      code: row['code'] || '',
      name: row['era'] || '',
      myaRange: row['mya_range'] || ''
    })).filter(e => e.code)
  }

  // Extract clades from Clade Markers table
  const cladesTable = tables.find(t => t.title.toLowerCase().includes('clade'))
  if (cladesTable) {
    meta.clades = cladesTable.rows.map(row => ({
      symbol: row['symbol'] || '',
      name: row['clade'] || '',
      description: row['description'] || '',
      count: parseInt(row['cards'] || row['card_count'] || '0', 10)
    })).filter(c => c.symbol || c.name)
  }

  return meta
}

export function extractGameModes(markdown) {
  const modes = []
  const sections = markdown.split(/(?=^##\s+Game\s+\d+:)/gim)

  for (const section of sections) {
    if (!section.trim().startsWith('##')) continue

    const lines = section.split('\n')
    const titleLine = lines[0] || ''
    const titleMatch = titleLine.match(/Game\s+\d+:\s*(.+)/i)
    if (!titleMatch) continue

    const name = titleMatch[1].trim()
    
    // Extract player count and time
    let players = ''
    let time = ''
    let complexity = ''

    for (const line of lines) {
      if (line.includes('Players:')) {
        players = line.split(':')[1]?.trim() || ''
      }
      if (line.includes('Time:')) {
        time = line.split(':')[1]?.trim() || ''
      }
      if (line.includes('Complexity:')) {
        complexity = line.split(':')[1]?.trim() || ''
      }
    }

    modes.push({
      name,
      players,
      time,
      complexity,
      content: section.trim()
    })
  }

  return modes
}

export function extractPrintSpecs(markdown) {
  const specs = {}
  const specMatch = markdown.match(/## Print Specifications[\s\S]*?(?=\n##|\Z)/i)
  
  if (!specMatch) return specs

  const tables = extractTablesFromMarkdown(specMatch[0])
  for (const table of tables) {
    for (const row of table.rows) {
      const element = row['element'] || ''
      const value = row['specification'] || row['value'] || ''
      if (element && value) {
        specs[element.toLowerCase().replace(/\s+/g, '_')] = value
      }
    }
  }

  return specs
}

