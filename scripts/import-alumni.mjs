/**
 * Import alumni records from CSV into the Supabase alumni table.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-alumni.mjs
 *
 * Reads VITE_SUPABASE_URL from .env in the project root.
 * Requires csv-parse: npm install csv-parse
 *
 * The script is idempotent — rows where full_name + entry_class already
 * exist in the alumni table are skipped.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CSV_PATH = resolve(PROJECT_ROOT, 'docs', 'Banco de Dados Oficial Alumni Automacao.csv')

// Read .env manually (no dotenv dependency required — just parse key=value)
function loadEnv(envPath) {
  try {
    const contents = readFileSync(envPath, 'utf-8')
    const env = {}
    for (const line of contents.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

const fileEnv = loadEnv(resolve(PROJECT_ROOT, '.env'))

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  console.error('ERROR: VITE_SUPABASE_URL not set. Add it to .env or export it.')
  process.exit(1)
}
if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY env var is required. Do not hardcode it.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Transform entry_class from raw CSV value to canonical "YYYY.S" format.
 * "19901" → "1990.1"
 * "2024.2" → "2024.2"  (already canonical — keep as-is)
 * ""       → null
 */
function normalizeEntryClass(raw) {
  if (!raw || !raw.trim()) return null
  const val = raw.trim()
  if (/^\d{5}$/.test(val)) {
    return val.slice(0, 4) + '.' + val.slice(4)
  }
  if (/^\d{4}\.\d$/.test(val)) {
    return val
  }
  // Unexpected format — return as-is but warn
  console.warn(`  WARN: unexpected entry_class format: ${JSON.stringify(val)}`)
  return val
}

/**
 * Normalize graduation_class with the same logic as entry_class.
 */
function normalizeGraduationClass(raw) {
  return normalizeEntryClass(raw)
}

/**
 * Ensure a LinkedIn URL has an https:// scheme.
 * "linkedin.com/…"      → "https://linkedin.com/…"
 * "www.linkedin.com/…"  → "https://www.linkedin.com/…"
 * "https://…"           → unchanged
 */
function normalizeLinkedIn(raw) {
  if (!raw || !raw.trim()) return null
  const val = raw.trim()
  if (val.startsWith('http://') || val.startsWith('https://')) return val
  return 'https://' + val
}

/**
 * Parse a comma-separated extracurriculars string into a trimmed array.
 * Returns null if the string is empty.
 */
function parseExtracurriculars(raw) {
  if (!raw || !raw.trim()) return null
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Map "Sim"/"sim" → true, "Não"/"não" → false, anything else → null.
 */
function parseBoolean(raw) {
  if (!raw || !raw.trim()) return null
  const lower = raw.trim().toLowerCase()
  if (lower === 'sim') return true
  if (lower === 'não' || lower === 'nao') return false
  return null
}

// ---------------------------------------------------------------------------
// Company cache: name → uuid
// ---------------------------------------------------------------------------

/** Fetch or create a company by name, returns its uuid. */
async function upsertCompany(name, companyCache, sectorId) {
  const normalized = name.trim()
  if (!normalized) return null

  if (companyCache.has(normalized)) {
    return companyCache.get(normalized)
  }

  // Check if it already exists in the DB
  const { data: existing, error: fetchError } = await supabase
    .from('companies')
    .select('id')
    .eq('name', normalized)
    .maybeSingle()

  if (fetchError) {
    console.warn(`  WARN: could not look up company "${normalized}": ${fetchError.message}`)
    return null
  }

  if (existing) {
    companyCache.set(normalized, existing.id)
    return existing.id
  }

  // Create it — sector_id is required by the schema; use the generic sector
  const { data: created, error: insertError } = await supabase
    .from('companies')
    .insert({ name: normalized, sector_id: sectorId, status: 'approved' })
    .select('id')
    .single()

  if (insertError) {
    console.warn(`  WARN: could not create company "${normalized}": ${insertError.message}`)
    return null
  }

  console.log(`  + Created company: ${normalized}`)
  companyCache.set(normalized, created.id)
  return created.id
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Alumni CSV Import ===')
  console.log(`CSV: ${CSV_PATH}`)

  // ------------------------------------------------------------------
  // 1. Parse CSV
  // ------------------------------------------------------------------
  const csvBuffer = readFileSync(CSV_PATH)
  const records = parse(csvBuffer, {
    columns: false,      // indexed by position
    skip_empty_lines: true,
    from_line: 2,        // skip header row
    relax_column_count: true,
    encoding: 'latin1',
  })

  console.log(`Parsed ${records.length} rows from CSV`)

  // ------------------------------------------------------------------
  // 2. Fetch existing alumni to enable idempotency check
  // ------------------------------------------------------------------
  const { data: existingAlumni, error: fetchExistingError } = await supabase
    .from('alumni')
    .select('full_name, entry_class')

  if (fetchExistingError) {
    console.error('ERROR: could not fetch existing alumni:', fetchExistingError.message)
    process.exit(1)
  }

  // Build a Set of "full_name|entry_class" keys for fast lookup
  const existingKeys = new Set(
    (existingAlumni || []).map((a) => `${a.full_name}|${a.entry_class ?? ''}`)
  )
  console.log(`Found ${existingKeys.size} existing alumni records in DB`)

  // ------------------------------------------------------------------
  // 3. Resolve the generic "Não classificado" sector (create if needed)
  // ------------------------------------------------------------------
  let genericSectorId

  const { data: sectorRow } = await supabase
    .from('sectors')
    .select('id')
    .eq('name', 'Não classificado')
    .maybeSingle()

  if (sectorRow) {
    genericSectorId = sectorRow.id
  } else {
    const { data: newSector, error: sectorErr } = await supabase
      .from('sectors')
      .insert({ name: 'Não classificado', display_order: 99 })
      .select('id')
      .single()

    if (sectorErr) {
      console.error('ERROR: could not create generic sector:', sectorErr.message)
      process.exit(1)
    }
    genericSectorId = newSector.id
    console.log('Created generic sector "Não classificado"')
  }

  // ------------------------------------------------------------------
  // 4. Process rows
  // ------------------------------------------------------------------
  const companyCache = new Map()

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < records.length; i++) {
    const row = records[i]

    // Column mapping (0-indexed):
    // 0  Nome completo
    // 1  Respondeu o formulário?
    // 2  Ano Ingresso
    // 3  Ano Formatura
    // 4  e-mail
    // 5  Linkedin
    // 6  Sexo
    // 7  Preencheu o form_atual?
    // 8  Nome no Formulário (duplicate — skip)
    // 9  Email no Formulário? (duplicate — skip)
    // 10 Você está trabalhando atualmente?
    // 11 Qual a empresa/organização que está trabalhando agora?
    // 12 Qual seu cargo?
    // 13 Atividades extracurriculares
    // 14 Experience text (discard)
    // 15 Experiência internacional? (Sim/Não)
    // 16 Tipo experiência internacional
    // 17 Para qual lugar?
    // 18-25 Phase engagement questions (skip)
    // 26 Interações Anteriores (skip)
    // 27-28 % scores (skip)

    const fullName = (row[0] || '').trim()

    // Skip rows with no name
    if (!fullName) {
      skipped++
      continue
    }

    const entryClass = normalizeEntryClass(row[2])
    const graduationClass = normalizeGraduationClass(row[3])

    // Idempotency: skip if full_name + entry_class already exists
    const dedupeKey = `${fullName}|${entryClass ?? ''}`
    if (existingKeys.has(dedupeKey)) {
      skipped++
      continue
    }

    const contactEmail = (row[4] || '').trim() || null
    const linkedinUrl = normalizeLinkedIn(row[5])
    const rawGender = (row[6] || '').trim()
    const gender = rawGender === 'M' || rawGender === 'F' ? rawGender : null
    const currentlyEmployed = parseBoolean(row[10])
    const rawCompany = (row[11] || '').trim()
    const jobTitle = (row[12] || '').trim() || null
    const extracurriculars = parseExtracurriculars(row[13])
    const hasIntlExperience = parseBoolean(row[15]) === true
    const intlExperienceType = (row[16] || '').trim() || null
    const intlExperienceDetail = (row[17] || '').trim() || null

    // Resolve company
    let companyId = null
    if (rawCompany) {
      companyId = await upsertCompany(rawCompany, companyCache, genericSectorId)
    }

    const alumniRecord = {
      full_name: fullName,
      entry_class: entryClass,
      graduation_class: graduationClass,
      contact_email: contactEmail,
      linkedin_url: linkedinUrl,
      gender,
      currently_employed: currentlyEmployed,
      company_id: companyId,
      job_title: jobTitle,
      extracurriculars,
      has_international_experience: hasIntlExperience,
      international_experience_type: intlExperienceType,
      international_experience_detail: intlExperienceDetail,
    }

    const { error: insertError } = await supabase.from('alumni').insert(alumniRecord)

    if (insertError) {
      console.error(`  ERROR row ${i + 2} (${fullName}): ${insertError.message}`)
      errors++
    } else {
      inserted++
      if (inserted % 100 === 0) {
        console.log(`  ... inserted ${inserted} records so far`)
      }
    }

    // Add to local set so subsequent duplicate rows in the same CSV are skipped
    existingKeys.add(dedupeKey)
  }

  // ------------------------------------------------------------------
  // 5. Summary
  // ------------------------------------------------------------------
  console.log('\n=== Import complete ===')
  console.log(`  Inserted : ${inserted}`)
  console.log(`  Skipped  : ${skipped}`)
  console.log(`  Errors   : ${errors}`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
