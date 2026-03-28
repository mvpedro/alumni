/**
 * Scrape interview texts from the Wayback Machine archive of alumniautomacaoufsc.com.br
 *
 * Usage: node scripts/scrape-interviews.mjs
 *
 * Outputs JSON files to scripts/interviews/ with title, slug, date, content (markdown)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = resolve(__dirname, 'interviews')

const BASE = 'https://web.archive.org/web/2022/http://alumniautomacaoufsc.com.br'

const PAGES = [
  'anderson-nielson', 'andre-cordazzo', 'andres-codas', 'antonio-emygdio',
  'bernardo-castro', 'bruno-dilda', 'carlos-mauad', 'danilo-pavei',
  'diego-dias', 'diego-vieira', 'eduardo-bonet', 'eduardo-zen',
  'elisa-manfrin', 'elson-arruda', 'fabio-akira', 'fabio-alonso',
  'fabio-terra', 'fernando-martinelli', 'fernando-pereira', 'gregori-daminelli',
  'guilherme-althoff', 'joao-bernartt', 'joao-paulo-milanezi', 'lucas-neves',
  'luiz-schrickte', 'marcel-gava', 'marcelo-ueda', 'max-hering',
  'musa-morena', 'procopio', 'rafael-davila', 'rafael-leal',
  'raphael-coelho', 'renan-capaverde', 'rodolfo-flesch', 'rodrigo-carvalho',
  'shana-boff',
]

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

function htmlToMarkdown(html) {
  // Remove wayback toolbar and scripts
  html = html.replace(/<!--\s*BEGIN WAYBACK TOOLBAR INSERT\s*-->[\s\S]*?<!--\s*END WAYBACK TOOLBAR INSERT\s*-->/gi, '')
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '')
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '')
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '')

  // Extract just the main content area — look for the interview text
  // The interviews use spans with "perm_contact_calendar-->" as question markers

  // Convert question markers to markdown headers
  html = html.replace(/perm_contact_calendar-->/g, '## ')

  // Convert basic HTML to markdown
  html = html.replace(/<br\s*\/?>/gi, '\n')
  html = html.replace(/<\/p>/gi, '\n\n')
  html = html.replace(/<p[^>]*>/gi, '')
  html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  html = html.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
  html = html.replace(/<b>(.*?)<\/b>/gi, '**$1**')
  html = html.replace(/<em>(.*?)<\/em>/gi, '*$1*')
  html = html.replace(/<i>(.*?)<\/i>/gi, '*$1*')
  html = html.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // Strip remaining HTML tags
  html = html.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  html = html.replace(/&amp;/g, '&')
  html = html.replace(/&lt;/g, '<')
  html = html.replace(/&gt;/g, '>')
  html = html.replace(/&quot;/g, '"')
  html = html.replace(/&#39;/g, "'")
  html = html.replace(/&nbsp;/g, ' ')
  html = html.replace(/&#\d+;/g, '')

  // Clean up whitespace
  html = html.replace(/\n{3,}/g, '\n\n')
  html = html.trim()

  // Try to extract just the interview portion (after "Sobre" or the first question)
  const sobreIdx = html.indexOf('Sobre ')
  const questionIdx = html.indexOf('## ')
  const startIdx = sobreIdx !== -1 ? sobreIdx : (questionIdx !== -1 ? questionIdx : 0)

  // Find the end — usually before "sidebar" or navigation content at the bottom
  let content = html.substring(startIdx)

  // Remove common footer/nav garbage
  const footerMarkers = ['Facebook', 'Desenvolvido por', 'sidebar', 'jQuery', 'window.', 'function(']
  for (const marker of footerMarkers) {
    const idx = content.lastIndexOf(marker)
    if (idx > content.length * 0.7) {
      content = content.substring(0, idx)
    }
  }

  return content.trim()
}

function extractTitle(html, slug) {
  // Try to find the person's name in the page title or h1/h2
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)
  const h2Match = html.match(/<h2[^>]*>([^<]*)<\/h2>/i)

  let title = h1Match?.[1] || h2Match?.[1] || titleMatch?.[1] || slug
  title = title.replace(/Alumni Automa.*?UFSC/gi, '').replace(/Entrevista/gi, '').replace(/[|\-–]/g, '').trim()

  // If still empty, format slug as title
  if (!title || title.length < 3) {
    title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return title
}

function extractDate(html) {
  // Look for date patterns like DD/MM/YYYY
  const match = html.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`
  }
  return null
}

async function scrapeInterview(slug) {
  const url = `${BASE}/${slug}.html`
  console.log(`  Fetching ${slug}...`)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Alumni-Scraper/1.0 (educational project)' },
    })

    if (!response.ok) {
      console.log(`    WARN: ${response.status} for ${slug}`)
      return null
    }

    const html = await response.text()
    const title = extractTitle(html, slug)
    const date = extractDate(html)
    const content = htmlToMarkdown(html)

    if (content.length < 100) {
      console.log(`    WARN: very short content for ${slug} (${content.length} chars)`)
    }

    return { slug, title, date, content }
  } catch (err) {
    console.log(`    ERROR: ${err.message}`)
    return null
  }
}

async function main() {
  console.log(`Scraping ${PAGES.length} interviews from Wayback Machine...\n`)

  let success = 0
  let failed = 0

  for (const slug of PAGES) {
    const result = await scrapeInterview(slug)

    if (result) {
      const outPath = resolve(OUTPUT_DIR, `${slug}.json`)
      writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
      console.log(`    OK: "${result.title}" (${result.content.length} chars, date: ${result.date || 'unknown'})`)
      success++
    } else {
      failed++
    }

    // Be polite to the Wayback Machine
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n=== Done ===`)
  console.log(`  Success: ${success}`)
  console.log(`  Failed:  ${failed}`)
  console.log(`  Output:  ${OUTPUT_DIR}`)
}

main()
