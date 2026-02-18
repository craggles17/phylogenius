import Handlebars from 'handlebars'
import { readText, resolveFromRoot } from './file-utils.js'

let templatesLoaded = false
const compiledTemplates = {}

export async function loadTemplates() {
  if (templatesLoaded) return

  const templateFiles = ['card', 'card-sheet', 'rulebook', 'nav']
  
  for (const name of templateFiles) {
    const path = resolveFromRoot('templates', `${name}.hbs`)
    const source = await readText(path)
    compiledTemplates[name] = Handlebars.compile(source)
  }

  // Register nav as a partial
  Handlebars.registerPartial('nav', compiledTemplates.nav)

  templatesLoaded = true
}

export function renderTemplate(name, data) {
  const template = compiledTemplates[name]
  if (!template) {
    throw new Error(`Template not found: ${name}`)
  }
  return template(data)
}

// Register helpers
Handlebars.registerHelper('eq', (a, b) => a === b)
Handlebars.registerHelper('gt', (a, b) => a > b)
Handlebars.registerHelper('lt', (a, b) => a < b)
Handlebars.registerHelper('frequencyBar', (percent) => {
  const filled = Math.round(percent / 10)
  const empty = 10 - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
})
Handlebars.registerHelper('heritabilityDots', (h2) => {
  const filled = Math.round(h2 * 5)
  const empty = 5 - filled
  return '●'.repeat(filled) + '○'.repeat(empty)
})

