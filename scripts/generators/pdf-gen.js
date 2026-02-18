// Generate PDF from HTML using puppeteer

import puppeteer from 'puppeteer'
import { ensureDir, resolveFromRoot } from '../utils/file-utils.js'
import { join } from 'path'

export async function generatePdf(htmlPath, outputPath, options = {}) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

  const pdfOptions = {
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm'
    },
    ...options
  }

  await page.pdf(pdfOptions)
  await browser.close()

  return outputPath
}

export async function generateRulebookPdf(rulebookDir, outputPath) {
  await ensureDir(join(outputPath, '..'))

  // Generate a combined HTML for PDF
  const indexPath = join(rulebookDir, 'index.html')
  
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  // Collect all section pages
  const sections = [
    'core.html',
    'cambrian.html', 
    'human.html',
    'evo.html',
    'modes.html',
    'design.html'
  ]

  let combinedHtml = ''
  
  for (const section of sections) {
    const sectionPath = join(rulebookDir, section)
    try {
      await page.goto(`file://${sectionPath}`, { waitUntil: 'networkidle0' })
      const content = await page.$eval('.rulebook__content', el => el.innerHTML)
      combinedHtml += `<div class="pdf-section">${content}</div>`
    } catch {
      console.log(`Skipping ${section} (not found)`)
    }
  }

  // Create combined page for PDF
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .pdf-section { page-break-after: always; padding: 20mm; }
        h1 { color: #1A237E; border-bottom: 2px solid #1A237E; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; font-size: 36pt; border: none;">Phylogenius</h1>
      <p style="text-align: center; font-size: 14pt; color: #666;">Complete Rulebook</p>
      <div style="page-break-after: always;"></div>
      ${combinedHtml}
    </body>
    </html>
  `, { waitUntil: 'networkidle0' })

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  })

  await browser.close()
  return outputPath
}

export async function generateCardSheetsPdf(sheetsDir, outputPath, deckTitle) {
  await ensureDir(join(outputPath, '..'))

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const fs = await import('fs/promises')
  const files = await fs.readdir(sheetsDir)
  const sheetFiles = files.filter(f => f.startsWith('sheet-') && f.endsWith('.html')).sort()

  if (sheetFiles.length === 0) {
    await browser.close()
    console.log(`  No sheet files found in ${sheetsDir}`)
    return null
  }

  // Build combined HTML with all sheets
  let allSheetsHtml = ''
  
  for (let i = 0; i < sheetFiles.length; i++) {
    const sheetPath = join(sheetsDir, sheetFiles[i])
    await page.goto(`file://${sheetPath}`, { waitUntil: 'networkidle0' })
    const sheetContent = await page.$eval('.sheet', el => el.outerHTML)
    allSheetsHtml += sheetContent
    if (i < sheetFiles.length - 1) {
      allSheetsHtml += '<div style="page-break-after: always;"></div>'
    }
  }

  // Render combined PDF
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A4; margin: 10mm; }
        body { margin: 0; padding: 0; font-family: sans-serif; }
        .sheet {
          width: 190mm;
          height: 277mm;
          display: grid;
          grid-template-columns: repeat(3, 63mm);
          grid-template-rows: repeat(3, 88mm);
          gap: 3mm;
          justify-content: center;
          align-content: center;
        }
        .card {
          width: 63mm;
          height: 88mm;
          border: 0.5pt solid #333;
          border-radius: 3mm;
          background: #fefcf8;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: sans-serif;
          font-size: 8pt;
          box-sizing: border-box;
        }
        .card__header {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 4px 8px;
          border-bottom: 0.5pt solid #ccc;
          background: #f8f4ec;
        }
        .card__icon { font-size: 14px; }
        .card__title {
          font-size: 10pt;
          font-weight: bold;
          margin: 0;
          flex: 1;
          text-transform: uppercase;
        }
        .card__number {
          font-size: 7pt;
          color: #888;
        }
        .card__illustration {
          flex: 1;
          background: #f0e8d8;
          margin: 3px 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0.5pt solid #d4c9b8;
        }
        .card__illustration-icon {
          font-size: 32px;
          opacity: 0.3;
        }
        .card__data {
          padding: 3px 6px;
          background: #f5f0e8;
          font-size: 7pt;
        }
        .card__row {
          display: flex;
          gap: 4px;
          padding: 2px 0;
          border-bottom: 0.5pt dotted #ddd;
        }
        .card__label { color: #666; min-width: 28px; }
        .card__value { font-weight: 500; }
        .card__era {
          font-size: 6pt;
          padding: 1px 4px;
          border-radius: 2px;
          color: white;
          margin-left: auto;
        }
        .card__connections {
          padding: 2px 6px;
          font-size: 6pt;
          display: flex;
          gap: 4px;
        }
        .card__flavour {
          font-size: 6pt;
          font-style: italic;
          text-align: center;
          padding: 3px 6px;
          color: #666;
          margin: 0;
        }
        .card__footer {
          padding: 3px;
          text-align: center;
          color: white;
          font-size: 6pt;
          font-weight: bold;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      ${allSheetsHtml}
    </body>
    </html>
  `, { waitUntil: 'networkidle0' })

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' }
  })

  await browser.close()
  return outputPath
}

