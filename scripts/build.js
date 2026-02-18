#!/usr/bin/env node

// Main build entry point for Phylogenius card generation

import { readText, ensureDir, resolveFromRoot } from './utils/file-utils.js'
import { extractCardsFromMarkdown } from './parsers/card-extractor.js'
import { writeCardFiles } from './generators/card-html.js'
import { generateAllSheets } from './generators/sheet-html.js'
import { generateRulebookHtml } from './generators/rulebook-html.js'
import { generateRulebookPdf, generateCardSheetsPdf } from './generators/pdf-gen.js'
import { join } from 'path'

const DECKS = {
  cambrian: {
    file: 'cambrian_prehistory_deck.md',
    type: 'cambrian',
    title: 'Cambrian Prehistory'
  },
  human: {
    file: 'human_genetics_deck.md',
    type: 'human',
    title: 'Human Genetics'
  },
  evo: {
    file: 'universal_evo_deck_1.md',
    type: 'evo',
    title: 'Universal Evo'
  }
}

async function buildCards(deckName) {
  const distDir = resolveFromRoot('dist')
  const cardsDir = join(distDir, 'cards')
  
  // Copy styles to dist
  await copyStyles(distDir)
  
  const decksToProcess = deckName ? [DECKS[deckName]] : Object.values(DECKS)
  
  for (const deck of decksToProcess) {
    if (!deck) continue
    
    console.log(`Building cards for ${deck.title}...`)
    
    const markdown = await readText(resolveFromRoot(deck.file))
    const cards = extractCardsFromMarkdown(markdown, deck.type)
    
    if (cards.length === 0) {
      console.log(`  No cards found in ${deck.file}`)
      continue
    }

    const deckDir = join(cardsDir, deck.type)
    const sheetsDir = join(deckDir, 'sheets')
    
    // Generate individual card pages
    const cardCount = await writeCardFiles(cards, deck.type, deckDir)
    console.log(`  Generated ${cardCount} card pages`)

    // Generate print sheets
    const sheetCount = await generateAllSheets(cards, deck.type, sheetsDir)
    console.log(`  Generated ${sheetCount} print sheets`)
  }

  // Generate cards index
  await generateCardsIndex(cardsDir)
  console.log('Cards build complete!')
}

async function copyStyles(distDir) {
  const stylesDir = resolveFromRoot('styles')
  const destDir = join(distDir, 'styles')
  await ensureDir(destDir)
  
  const styleFiles = ['variables.css', 'card.css', 'print.css', 'rulebook.css']
  for (const file of styleFiles) {
    const content = await readText(join(stylesDir, file))
    const { writeText } = await import('./utils/file-utils.js')
    await writeText(join(destDir, file), content)
  }
}

async function generateCardsIndex(cardsDir) {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phylogenius Card Decks</title>
  <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Crimson+Pro:ital@1&display=swap" rel="stylesheet">
  <style>
    :root {
      --cambrian: #0d3b66;
      --human: #2563eb;
      --evo: #7c3aed;
      --gold: #c9a227;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Josefin Sans', sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: 
        radial-gradient(ellipse at top left, rgba(13,59,102,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(124,58,237,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at center, #f5f0e8 0%, #e8e0d0 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 900px;
      padding: 60px 30px;
      text-align: center;
    }
    h1 {
      font-size: 3.5rem;
      color: var(--cambrian);
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .subtitle {
      font-family: 'Crimson Pro', serif;
      font-style: italic;
      font-size: 1.3rem;
      color: #666;
      margin: 0 0 60px;
    }
    .deck-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }
    .deck-card {
      background: white;
      border-radius: 12px;
      padding: 35px 30px;
      text-decoration: none;
      color: inherit;
      box-shadow: 
        0 4px 20px rgba(0,0,0,0.08),
        0 0 0 1px rgba(0,0,0,0.04);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .deck-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--deck-color);
    }
    .deck-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(to top, rgba(0,0,0,0.02), transparent);
      pointer-events: none;
    }
    .deck-card:hover {
      transform: translateY(-5px);
      box-shadow: 
        0 12px 40px rgba(0,0,0,0.12),
        0 0 0 1px rgba(0,0,0,0.06);
    }
    .deck-card--cambrian { --deck-color: var(--cambrian); }
    .deck-card--human { --deck-color: var(--human); }
    .deck-card--evo { --deck-color: var(--evo); }
    .deck-icon {
      font-size: 3rem;
      margin-bottom: 15px;
      display: block;
    }
    .deck-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--deck-color);
      margin: 0 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .deck-count {
      font-size: 0.9rem;
      color: var(--gold);
      font-weight: 600;
      margin: 0 0 12px;
    }
    .deck-desc {
      font-size: 0.95rem;
      color: #666;
      line-height: 1.5;
      margin: 0;
    }
    footer {
      margin-top: 60px;
      padding: 20px;
      font-size: 0.85rem;
      color: #999;
    }
    footer a {
      color: var(--cambrian);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Phylogenius</h1>
    <p class="subtitle">Evolutionary Card Game System</p>
    
    <div class="deck-grid">
      <a href="cambrian/index.html" class="deck-card deck-card--cambrian">
        <span class="deck-icon">🌊</span>
        <h2 class="deck-title">Cambrian Prehistory</h2>
        <p class="deck-count">80 cards</p>
        <p class="deck-desc">Journey through 3.5 billion years of evolution, from the first cells to the Permian extinction.</p>
      </a>
      
      <a href="human/index.html" class="deck-card deck-card--human">
        <span class="deck-icon">🧬</span>
        <h2 class="deck-title">Human Genetics</h2>
        <p class="deck-count">96 cards</p>
        <p class="deck-desc">Explore human genetic variants with real population data from around the world.</p>
      </a>
      
      <a href="evo/index.html" class="deck-card deck-card--evo">
        <span class="deck-icon">🦴</span>
        <h2 class="deck-title">Universal Evo</h2>
        <p class="deck-count">80 cards</p>
        <p class="deck-desc">The animal kingdom's greatest innovations, from eyes to echolocation.</p>
      </a>
    </div>
    
    <footer>
      <a href="../rulebook/index.html">View Rulebook</a> • 
      <a href="../phylogenius-rulebook.pdf">Download PDF</a>
    </footer>
  </div>
</body>
</html>`

  await ensureDir(cardsDir)
  const { writeText } = await import('./utils/file-utils.js')
  await writeText(join(cardsDir, 'index.html'), indexHtml)
}

async function buildRulebook() {
  console.log('Building rulebook...')
  const distDir = resolveFromRoot('dist')
  const rulebookDir = join(distDir, 'rulebook')
  
  const pageCount = await generateRulebookHtml(rulebookDir)
  console.log(`  Generated ${pageCount} rulebook pages`)
  console.log('Rulebook build complete!')
}

async function buildPdf() {
  console.log('Generating PDFs...')
  const distDir = resolveFromRoot('dist')
  const rulebookDir = join(distDir, 'rulebook')
  const cardsDir = join(distDir, 'cards')
  
  // Generate rulebook PDF
  const rulebookPath = join(distDir, 'phylogenius-rulebook.pdf')
  await generateRulebookPdf(rulebookDir, rulebookPath)
  console.log(`  Generated rulebook PDF`)

  // Generate card PDFs for each deck
  for (const [name, deck] of Object.entries(DECKS)) {
    const sheetsDir = join(cardsDir, deck.type, 'sheets')
    const pdfPath = join(distDir, `${deck.type}-cards.pdf`)
    const result = await generateCardSheetsPdf(sheetsDir, pdfPath, deck.title)
    if (result) {
      console.log(`  Generated ${deck.title} cards PDF`)
    }
  }
  
  console.log('PDF build complete!')
}

async function buildAll() {
  await buildCards()
  await buildRulebook()
  await buildPdf()
}

async function watchMode() {
  const chokidar = await import('chokidar')
  
  console.log('Watching for changes...')
  console.log('Press Ctrl+C to stop\n')
  
  const watcher = chokidar.watch([
    resolveFromRoot('*.md'),
    resolveFromRoot('templates'),
    resolveFromRoot('styles')
  ], {
    ignoreInitial: true
  })

  watcher.on('change', async (path) => {
    console.log(`\nFile changed: ${path}`)
    
    if (path.endsWith('.md')) {
      await buildCards()
      await buildRulebook()
    } else if (path.includes('templates') || path.includes('styles')) {
      await buildCards()
      await buildRulebook()
    }
  })

  // Initial build
  await buildAll()
}

// CLI handling
const args = process.argv.slice(2)
const command = args[0] || 'all'
const deckFlag = args.indexOf('--deck')
const deckName = deckFlag >= 0 ? args[deckFlag + 1] : null

switch (command) {
  case 'cards':
    buildCards(deckName)
    break
  case 'rulebook':
    buildRulebook()
    break
  case 'pdf':
    buildPdf()
    break
  case 'dev':
    watchMode()
    break
  case 'all':
  default:
    buildAll()
}

