// Generate HTML for individual cards

import { loadTemplates, renderTemplate } from '../utils/template-loader.js'
import { writeText, ensureDir, resolveFromRoot } from '../utils/file-utils.js'
import { join } from 'path'

export async function generateCardHtml(card) {
  await loadTemplates()
  return renderTemplate('card', card)
}

export async function generateCardPage(card, deckType) {
  await loadTemplates()
  
  const cardHtml = renderTemplate('card', card)
  const slug = slugify(card.trait)
  
  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${card.trait} - ${getDeckTitle(deckType)}</title>
  <link rel="stylesheet" href="../../styles/variables.css">
  <link rel="stylesheet" href="../../styles/card.css">
</head>
<body class="card-page">
  ${cardHtml}
  <div class="card-meta">
    <a href="index.html" class="back-link">← Back to ${getDeckTitle(deckType)}</a>
  </div>
</body>
</html>`

  return { html: pageHtml, slug }
}

export async function generateDeckIndex(cards, deckType, deckMeta) {
  await loadTemplates()

  const groupedBySuit = groupBySuit(cards)
  const suitSections = Object.entries(groupedBySuit).map(([suit, suitCards]) => {
    const suitColor = suitCards[0]?.colors.primary || '#808080'
    const suitIcon = suitCards[0]?.colors.icon || '?'
    const links = suitCards.map(card => {
      const slug = slugify(card.trait)
      const valueDisplay = card.mya ? `${card.mya} MYA` : card.globalPercent ? `${card.globalPercent}%` : ''
      return `<a href="${card.id}-${slug}.html" class="card-link">
        <span class="card-link__icon">${suitIcon}</span>
        <span class="card-link__name">${card.trait}</span>
        <span class="card-link__value">${valueDisplay}</span>
      </a>`
    }).join('\n')
    
    return `<section class="suit-section" style="--suit-color: ${suitColor}">
      <h2 class="suit-title"><span class="suit-icon">${suitIcon}</span> ${suit}</h2>
      <p class="suit-count">${suitCards.length} cards</p>
      <div class="suit-cards">${links}</div>
    </section>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getDeckTitle(deckType)} - Card Index</title>
  <link rel="stylesheet" href="../../styles/variables.css">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: var(--font-body);
      margin: 0;
      padding: 0;
      background: radial-gradient(ellipse at top, #e8e4dc 0%, #d0c8b8 100%);
      background-attachment: fixed;
      min-height: 100vh;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 60px 30px;
    }
    header {
      text-align: center;
      margin-bottom: 50px;
    }
    h1 {
      font-family: var(--font-title);
      font-size: 2.8rem;
      color: var(--cambrian-body);
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .deck-meta {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }
    .suit-section {
      margin-bottom: 40px;
      background: var(--color-bg);
      border-radius: 12px;
      padding: 25px 30px;
      box-shadow: var(--shadow-md);
      border-left: 5px solid var(--suit-color);
      position: relative;
      overflow: hidden;
    }
    .suit-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.02), transparent);
    }
    .suit-title {
      margin: 0 0 5px;
      font-family: var(--font-title);
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .suit-icon {
      font-size: 1.3em;
    }
    .suit-count {
      margin: 0 0 20px;
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }
    .suit-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }
    .card-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      background: var(--color-bg-alt);
      border-radius: 6px;
      text-decoration: none;
      color: var(--color-text);
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .card-link:hover {
      background: white;
      border-color: var(--color-border);
      box-shadow: var(--shadow-sm);
      transform: translateX(3px);
    }
    .card-link__icon {
      font-size: 1.2em;
      opacity: 0.7;
    }
    .card-link__name {
      flex: 1;
      font-weight: 500;
    }
    .card-link__value {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }
    .back-link {
      display: inline-block;
      text-align: center;
      margin-top: 40px;
      padding: 12px 24px;
      background: white;
      color: var(--cambrian-body);
      text-decoration: none;
      font-weight: 600;
      border-radius: 6px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
    }
    .back-link:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    footer {
      text-align: center;
      padding: 40px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${getDeckTitle(deckType)}</h1>
      <p class="deck-meta">${cards.length} evolutionary trait cards</p>
    </header>
    ${suitSections}
    <footer>
      <a href="../index.html" class="back-link">← Back to All Decks</a>
    </footer>
  </div>
</body>
</html>`
}

export async function writeCardFiles(cards, deckType, outputDir) {
  await ensureDir(outputDir)

  // Write individual card pages
  for (const card of cards) {
    const { html, slug } = await generateCardPage(card, deckType)
    const filename = `${card.id}-${slug}.html`
    await writeText(join(outputDir, filename), html)
  }

  // Write index
  const indexHtml = await generateDeckIndex(cards, deckType, {})
  await writeText(join(outputDir, 'index.html'), indexHtml)

  return cards.length
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getDeckTitle(deckType) {
  const titles = {
    cambrian: 'Cambrian Prehistory Deck',
    human: 'Human Genetics Deck',
    evo: 'Universal Evo Deck'
  }
  return titles[deckType] || 'Card Deck'
}

function groupBySuit(cards) {
  const groups = {}
  for (const card of cards) {
    if (!groups[card.suit]) groups[card.suit] = []
    groups[card.suit].push(card)
  }
  return groups
}

