import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://vjceckswmormyvcspjyb.supabase.co'
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const INTERVIEWS_DIR = join(__dirname, 'interviews')

function fixContent(content) {
  let changed = false
  const lines = content.split('\n')
  const fixedLines = []

  for (const line of lines) {
    // Stop at lorem ipsum sentinel
    if (/^## Magna etiam veroeros/.test(line.trim())) {
      changed = true
      break
    }

    // Replace icon prefixes on question lines
    const prefixMatch = line.match(/^(warning|device_hub|child_care)(.+)$/)
    if (prefixMatch) {
      fixedLines.push(`## ${prefixMatch[2].trimStart()}`)
      changed = true
      continue
    }

    fixedLines.push(line)
  }

  // Trim trailing blank lines
  while (fixedLines.length > 0 && fixedLines[fixedLines.length - 1].trim() === '') {
    fixedLines.pop()
  }

  return { fixed: fixedLines.join('\n'), changed }
}

async function main() {
  const files = readdirSync(INTERVIEWS_DIR).filter((f) => f.endsWith('.json'))
  console.log(`Found ${files.length} interview files.\n`)

  const results = []

  for (const file of files) {
    const filePath = join(INTERVIEWS_DIR, file)
    const raw = readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    const slug = data.slug

    const { fixed, changed } = fixContent(data.content)

    if (!changed) {
      console.log(`[SKIP] ${file} — no changes needed`)
      continue
    }

    // Save fixed JSON
    data.content = fixed
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[FIXED] ${file} — saved locally`)

    // Update Supabase
    const { error } = await supabase
      .from('interviews')
      .update({ content: fixed })
      .eq('slug', slug)

    if (error) {
      console.error(`  [ERROR] Supabase update failed for slug="${slug}": ${error.message}`)
    } else {
      console.log(`  [SUPABASE] Updated slug="${slug}"`)
    }

    results.push(slug)
  }

  console.log(`\nDone. Fixed ${results.length} files: ${results.join(', ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
