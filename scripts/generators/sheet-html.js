// Generate print-ready card sheets (3x3 grid)

import { loadTemplates, renderTemplate } from '../utils/template-loader.js'
import { writeText, ensureDir } from '../utils/file-utils.js'
import { generateCardHtml } from './card-html.js'
import { join } from 'path'

const CARDS_PER_SHEET = 9

export async function generatePrintSheet(cards, sheetNumber, deckTitle) {
  await loadTemplates()

  const cardHtmls = await Promise.all(cards.map(c => generateCardHtml(c)))
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deckTitle} - Print Sheet ${sheetNumber}</title>
  <link rel="stylesheet" href="../../../styles/variables.css">
  <link rel="stylesheet" href="../../../styles/card.css">
  <link rel="stylesheet" href="../../../styles/print.css">
</head>
<body class="print-sheet">
  <div class="sheet" data-sheet="${sheetNumber}">
    <div class="sheet__grid">
      ${cardHtmls.join('\n')}
    </div>
  </div>
</body>
</html>`
}

export async function generateAllSheets(cards, deckType, outputDir) {
  await ensureDir(outputDir)
  
  const deckTitle = getDeckTitle(deckType)
  const sheets = chunkArray(cards, CARDS_PER_SHEET)
  const sheetFiles = []

  for (let i = 0; i < sheets.length; i++) {
    const sheetNumber = i + 1
    const html = await generatePrintSheet(sheets[i], sheetNumber, deckTitle)
    const filename = `sheet-${String(sheetNumber).padStart(2, '0')}.html`
    await writeText(join(outputDir, filename), html)
    sheetFiles.push(filename)
  }

  // Generate print index
  const indexHtml = generatePrintIndex(sheetFiles, deckTitle, cards.length)
  await writeText(join(outputDir, 'print-index.html'), indexHtml)

  return sheets.length
}

function generatePrintIndex(sheetFiles, deckTitle, totalCards) {
  const sheetLinks = sheetFiles.map((file, i) => 
    `<a href="${file}" class="sheet-link">Sheet ${i + 1}</a>`
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deckTitle} - Print Sheets</title>
  <link rel="stylesheet" href="../../../styles/variables.css">
  <style>
    body {
      font-family: var(--font-body);
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      font-family: var(--font-title);
      color: var(--cambrian-body);
    }
    .info {
      background: var(--color-bg-alt);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .sheet-link {
      display: block;
      padding: 15px 20px;
      margin-bottom: 10px;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      text-decoration: none;
      color: var(--color-text);
    }
    .sheet-link:hover {
      border-color: var(--cambrian-body);
    }
    .instructions {
      margin-top: 30px;
      font-size: 0.9em;
      color: var(--color-text-secondary);
    }
  </style>
</head>
<body>
  <h1>${deckTitle}</h1>
  <div class="info">
    <strong>${totalCards} cards</strong> across <strong>${sheetFiles.length} sheets</strong>
    <br>Each sheet contains up to 9 cards (3×3 grid)
  </div>
  
  <h2>Print Sheets</h2>
  ${sheetLinks}
  
  <div class="instructions">
    <h3>Printing Instructions</h3>
    <ol>
      <li>Open each sheet in your browser</li>
      <li>Print at 100% scale (no fit-to-page)</li>
      <li>Use A4 paper, 300gsm cardstock recommended</li>
      <li>Cut along the card borders</li>
    </ol>
  </div>
</body>
</html>`
}

function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function getDeckTitle(deckType) {
  const titles = {
    cambrian: 'Cambrian Prehistory Deck',
    human: 'Human Genetics Deck',
    evo: 'Universal Evo Deck'
  }
  return titles[deckType] || 'Card Deck'
}

