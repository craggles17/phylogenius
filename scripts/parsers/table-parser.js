// Parse markdown tables into arrays of objects

export function parseMarkdownTable(tableText) {
  const lines = tableText.trim().split('\n')
  if (lines.length < 2) return []

  // First line is headers
  const headers = parseTableRow(lines[0])
  
  // Second line is separator (skip it)
  // Remaining lines are data
  const rows = []
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || !line.startsWith('|')) continue
    
    const values = parseTableRow(line)
    const row = {}
    headers.forEach((header, idx) => {
      row[normalizeHeader(header)] = values[idx] || ''
    })
    rows.push(row)
  }

  return rows
}

function parseTableRow(line) {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
}

function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function extractTablesFromMarkdown(markdown) {
  const tables = []
  const lines = markdown.split('\n')
  
  let inTable = false
  let currentTable = []
  let tableTitle = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Check for header before table
    if (trimmed.startsWith('#')) {
      tableTitle = trimmed.replace(/^#+\s*/, '')
    }

    // Detect table start
    if (trimmed.startsWith('|') && !inTable) {
      inTable = true
      currentTable = [line]
      continue
    }

    // Continue table
    if (inTable && trimmed.startsWith('|')) {
      currentTable.push(line)
      continue
    }

    // End table
    if (inTable && !trimmed.startsWith('|')) {
      tables.push({
        title: tableTitle,
        raw: currentTable.join('\n'),
        rows: parseMarkdownTable(currentTable.join('\n'))
      })
      inTable = false
      currentTable = []
    }
  }

  // Handle table at end of file
  if (inTable && currentTable.length > 0) {
    tables.push({
      title: tableTitle,
      raw: currentTable.join('\n'),
      rows: parseMarkdownTable(currentTable.join('\n'))
    })
  }

  return tables
}

export function findTableByTitle(tables, titlePattern) {
  const pattern = titlePattern.toLowerCase()
  return tables.find(t => t.title.toLowerCase().includes(pattern))
}

export function findCardTables(tables) {
  // Card tables have specific columns: #, Trait, MYA or Gene
  return tables.filter(t => {
    if (t.rows.length === 0) return false
    const firstRow = t.rows[0]
    const keys = Object.keys(firstRow)
    return keys.some(k => k === 'trait' || k === 'card')
  })
}

