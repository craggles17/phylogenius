// Generate HTML rulebook from markdown files

import { marked } from 'marked'
import { readText, writeText, ensureDir, listFiles, resolveFromRoot } from '../utils/file-utils.js'
import { extractDeckMeta } from '../parsers/meta-parser.js'
import { join, basename } from 'path'

const RULEBOOK_FILES = [
  { file: 'core_rules.md', id: 'core', title: 'Core Rules' },
  { file: 'cambrian_prehistory_deck.md', id: 'cambrian', title: 'Cambrian Deck' },
  { file: 'human_genetics_deck.md', id: 'human', title: 'Human Genetics' },
  { file: 'universal_evo_deck_1.md', id: 'evo', title: 'Universal Evo' },
  { file: 'evo_deck_game_modes.md', id: 'modes', title: 'Game Modes' },
  { file: 'card_design_system.md', id: 'design', title: 'Design System' }
]

export async function generateRulebookHtml(outputDir) {
  await ensureDir(outputDir)
  await ensureDir(join(outputDir, 'styles'))
  
  // Copy styles
  await copyStyles(outputDir)

  const sections = []
  
  // Process each markdown file
  for (const entry of RULEBOOK_FILES) {
    const filePath = resolveFromRoot(entry.file)
    let markdown
    
    try {
      markdown = await readText(filePath)
    } catch {
      console.log(`Skipping ${entry.file} (not found)`)
      continue
    }

    const content = marked.parse(markdown)
    const meta = extractDeckMeta(markdown)
    
    sections.push({
      id: entry.id,
      title: entry.title,
      href: `${entry.id}.html`,
      content,
      meta
    })
  }

  // Generate individual pages
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const prevSection = i > 0 ? sections[i - 1] : null
    const nextSection = i < sections.length - 1 ? sections[i + 1] : null
    
    const html = generateRulebookPage(section, sections, prevSection, nextSection)
    await writeText(join(outputDir, section.href), html)
  }

  // Generate index
  const indexHtml = generateRulebookIndex(sections)
  await writeText(join(outputDir, 'index.html'), indexHtml)

  return sections.length
}

function generateRulebookPage(section, allSections, prevSection, nextSection) {
  const navHtml = generateNav(allSections, section.id)
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${section.title} - Phylogenius Rulebook</title>
  <link rel="stylesheet" href="styles/variables.css">
  <link rel="stylesheet" href="styles/rulebook.css">
</head>
<body class="rulebook">
  <header class="rulebook__header">
    <h1 class="rulebook__title">${section.title}</h1>
  </header>

  ${navHtml}

  <main class="rulebook__content">
    ${section.content}
  </main>

  <footer class="rulebook__footer">
    <p>Phylogenius Card Game System</p>
    ${prevSection ? `<a href="${prevSection.href}" class="rulebook__nav-link">← ${prevSection.title}</a>` : '<span></span>'}
    ${nextSection ? `<a href="${nextSection.href}" class="rulebook__nav-link">${nextSection.title} →</a>` : '<span></span>'}
  </footer>
</body>
</html>`
}

function generateNav(sections, currentId) {
  const items = sections.map(s => {
    const active = s.id === currentId ? 'nav__item--active' : ''
    return `<li class="nav__item ${active}">
      <a href="${s.href}" class="nav__link">${s.title}</a>
    </li>`
  }).join('\n')

  return `<nav class="rulebook__nav">
    <ul class="nav__list">
      ${items}
    </ul>
  </nav>`
}

function generateRulebookIndex(sections) {
  const sectionCards = sections.map(s => `
    <a href="${s.href}" class="section-card">
      <h2 class="section-card__title">${s.title}</h2>
      <p class="section-card__desc">${getDescription(s.id)}</p>
    </a>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phylogenius Rulebook</title>
  <link rel="stylesheet" href="styles/variables.css">
  <link rel="stylesheet" href="styles/rulebook.css">
  <style>
    .index-header {
      text-align: center;
      padding: 60px 20px;
      grid-column: 1 / -1;
    }
    .index-header h1 {
      font-family: var(--font-title);
      font-size: 48pt;
      color: var(--cambrian-body);
      margin: 0;
    }
    .index-header p {
      font-size: 18pt;
      color: var(--color-text-secondary);
    }
    .sections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding: 40px;
      grid-column: 1 / -1;
    }
    .section-card {
      display: block;
      padding: 30px;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-text);
      transition: all 0.2s;
    }
    .section-card:hover {
      border-color: var(--cambrian-body);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .section-card__title {
      font-family: var(--font-title);
      font-size: 18pt;
      color: var(--cambrian-body);
      margin: 0 0 10px;
    }
    .section-card__desc {
      margin: 0;
      color: var(--color-text-secondary);
    }
  </style>
</head>
<body class="rulebook">
  <div class="index-header">
    <h1>Phylogenius</h1>
    <p>Evolutionary Card Game System</p>
  </div>
  
  <div class="sections-grid">
    ${sectionCards}
  </div>
</body>
</html>`
}

function getDescription(id) {
  const descriptions = {
    core: 'Shared mechanics across all decks',
    cambrian: '80 cards spanning 3.5 billion years',
    human: '96 cards with real population genetics',
    evo: 'Animal kingdom evolutionary traits',
    modes: 'Multiple game variants',
    design: 'Print and visual specifications'
  }
  return descriptions[id] || ''
}

async function copyStyles(outputDir) {
  const stylesDir = resolveFromRoot('styles')
  const destDir = join(outputDir, 'styles')
  await ensureDir(destDir)

  const files = ['variables.css', 'rulebook.css']
  for (const file of files) {
    const content = await readText(join(stylesDir, file))
    await writeText(join(destDir, file), content)
  }
}

