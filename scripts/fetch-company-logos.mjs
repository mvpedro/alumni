/**
 * Fetch company logos and upload to Supabase Storage.
 *
 * Strategy:
 * 1. Use a curated domain mapping for known companies
 * 2. Fetch logo from Google Favicon API (sz=128) or company website og:image
 * 3. Upload to Supabase Storage company-logos bucket
 * 4. Update companies.logo_url
 *
 * Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fetch-company-logos.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://vjceckswmormyvcspjyb.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Company → Domain mapping ────────────────────────────────────────────────
// Curated list: company name → website domain for logo fetching
const DOMAIN_MAP = {
  // Big Tech
  'Google': 'google.com',
  'Facebook Inc.': 'meta.com',
  'Meta Brasil': 'meta.com',
  'IBM': 'ibm.com',
  'Nubank': 'nubank.com.br',

  // Software
  'BIX Tecnologia': 'bfrtech.com',
  'Jungsoft': 'jungsoft.io',
  'Jungle Devs': 'jungledevs.com',
  'Indicium Tech': 'indicium.tech',
  'Involves': 'involves.com',
  'Neoway': 'neoway.com.br',
  'Resultados Digitais': 'rdstation.com',
  'Asksuite': 'asksuite.com',
  'Seazone': 'seazone.com.br',
  'Legiti': 'legiti.com',
  'Voltbras': 'voltbras.com.br',
  'Wildlife': 'wildlifestudios.com',
  'Celonis': 'celonis.com',
  'Sensorweb': 'sensorweb.com.br',
  'Cognite AS': 'cognite.com',
  'Khomp': 'khomp.com',
  'Pivotree': 'pivotree.com',
  'Signifyd': 'signifyd.com',
  'SiriusXM': 'siriusxm.com',

  // Engenharia
  'Radix Engenharia e Software': 'radixeng.com.br',
  'REIVAX': 'reivax.com.br',
  'Hexagon': 'hexagon.com',
  'Eaton Corporation': 'eaton.com',
  'GreyLogix Brasil': 'greylogix.com',
  'Quartz Technology': 'quartztechnology.com.br',
  'STMicroelectronics': 'st.com',
  'ON Semiconductor': 'onsemi.com',
  'DENSO': 'denso.com',
  'Octasic': 'octasic.com',
  'Vanderlande': 'vanderlande.com',

  // Fábrica e Indústria
  'Bosch': 'bosch.com',
  'Robert Bosch': 'bosch.com',
  'WEG': 'weg.net',
  'TIGRE': 'tigre.com.br',
  'ArcelorMittal': 'arcelormittal.com',
  'Siemens': 'siemens.com',
  'Electrolux': 'electrolux.com',
  'GE': 'ge.com',
  'General Electric International Inc.': 'ge.com',
  'AB Inbev': 'ab-inbev.com',

  // Energia
  'Petrobras': 'petrobras.com.br',
  'Transpetro': 'transpetro.com.br',
  'Shell': 'shell.com',
  'Halliburton': 'halliburton.com',
  'Baker Hughes - Bently Nevada': 'bakerhughes.com',
  'Engie Brasil': 'engie.com.br',

  // Aeroespacial
  'Embraer': 'embraer.com',
  'Rolls Royce Aero Engines': 'rolls-royce.com',
  'Mitsubishi Aircraft Corporation': 'mitsubishiaircraft.com',

  // Automotivo
  'Scania Latin America': 'scania.com',
  'Volvo do Brasil': 'volvo.com',
  'BMW AG': 'bmw.com',

  // Mercado Financeiro
  'BTG Pactual': 'btgpactual.com',
  'Stone': 'stone.com.br',
  'Banco do Brasil': 'bb.com.br',

  // Consultoria
  'Accenture': 'accenture.com',
  'LexisNexis Risk Solutions': 'risk.lexisnexis.com',
  'RedVentures': 'redventures.com',
  'Visagio': 'visagio.com',

  // Serviços
  'Dataprev': 'dataprev.gov.br',
  'Serasa': 'serasa.com.br',

  // Ensino
  'UFSC': 'ufsc.br',
  'Senai': 'senai.br',
  'Johns Hopkins University': 'jhu.edu',
  'University of Melbourne': 'unimelb.edu.au',

  // Startups
  'Portal Telemedicina': 'portaltelemedicina.com.br',
  'INpulse Animal Health': 'inpulseanimalhealth.com',
  'Dynamox': 'dynamox.net',
  'Bleu': 'bleu.com',
  'Griaule Biometrics': 'griaule.com',

  // More
  'Omatic Engenharia': 'omatic.com.br',
  'Fundação CERTI': 'certi.org.br',
  'Labmetro UFSC': 'labmetro.ufsc.br',
}

// ── Logo fetching strategies ────────────────────────────────────────────────

async function fetchGoogleFavicon(domain) {
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  const res = await fetch(url)
  if (!res.ok) return null
  const buf = Buffer.from(await res.arrayBuffer())
  // Skip tiny default favicons (< 1KB is usually the default globe icon)
  if (buf.length < 1000) return null
  return { buffer: buf, ext: 'png' }
}

async function fetchOgImage(domain) {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlumniBot/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const html = await res.text()

    // Try og:image first
    let match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i)
    if (match) {
      let imgUrl = match[1]
      if (imgUrl.startsWith('/')) imgUrl = `https://${domain}${imgUrl}`
      const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(5000) })
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer())
        if (buf.length > 2000) {
          const ext = imgUrl.match(/\.(png|jpg|jpeg|svg|webp)/i)?.[1] || 'png'
          return { buffer: buf, ext }
        }
      }
    }

    // Try apple-touch-icon or large favicon
    match = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)
    if (match) {
      let imgUrl = match[1]
      if (imgUrl.startsWith('/')) imgUrl = `https://${domain}${imgUrl}`
      const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(5000) })
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer())
        if (buf.length > 1000) return { buffer: buf, ext: 'png' }
      }
    }
  } catch (e) {
    // timeout or network error — skip
  }
  return null
}

async function fetchLogo(companyName) {
  const domain = DOMAIN_MAP[companyName]
  if (!domain) return null

  // Strategy 1: Google Favicon (fast, reliable)
  let result = await fetchGoogleFavicon(domain)
  if (result) return result

  // Strategy 2: OG Image from website (slower, larger images)
  result = await fetchOgImage(domain)
  if (result) return result

  return null
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Get all companies without logos, sorted by alumni count
  const { data: companies, error } = await supabase
    .from('company_alumni_counts')
    .select('company_id, company_name, logo_url, alumni_count')
    .order('alumni_count', { ascending: false })

  if (error) { console.error(error); process.exit(1) }

  const needLogos = companies.filter(c => !c.logo_url)
  console.log(`${needLogos.length} companies need logos (${companies.length} total)\n`)

  let fetched = 0, failed = 0, skipped = 0

  for (const company of needLogos) {
    const hasDomain = !!DOMAIN_MAP[company.company_name]
    if (!hasDomain) {
      skipped++
      continue
    }

    process.stdout.write(`  ${company.company_name} (${company.alumni_count})... `)

    try {
      const logo = await fetchLogo(company.company_name)
      if (!logo) {
        console.log('no logo found')
        failed++
        continue
      }

      // Upload to Supabase Storage
      const path = `${company.company_id}.${logo.ext}`
      const { error: uploadErr } = await supabase.storage
        .from('company-logos')
        .upload(path, logo.buffer, {
          upsert: true,
          contentType: `image/${logo.ext === 'jpg' ? 'jpeg' : logo.ext}`,
        })

      if (uploadErr) {
        console.log(`upload error: ${uploadErr.message}`)
        failed++
        continue
      }

      // Get public URL and update company
      const publicUrl = supabase.storage.from('company-logos').getPublicUrl(path).data.publicUrl

      await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', company.company_id)

      console.log(`✓ (${(logo.buffer.length / 1024).toFixed(1)}KB)`)
      fetched++
    } catch (err) {
      console.log(`error: ${err.message}`)
      failed++
    }

    // Be polite
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n=== Done ===`)
  console.log(`  Fetched: ${fetched}`)
  console.log(`  Failed:  ${failed}`)
  console.log(`  Skipped: ${skipped} (no domain mapping)`)
  console.log(`  Total:   ${needLogos.length}`)
}

main()
