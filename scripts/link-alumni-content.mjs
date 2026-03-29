/**
 * Auto-link interviews and trabalho_alumni records to alumni by name matching.
 * Matches are done with ilike so they are case-insensitive.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vjceckswmormyvcspjyb.supabase.co'
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function findAlumni(name) {
  if (!name || name.length < 3) return null
  const { data, error } = await supabase
    .from('alumni')
    .select('id, full_name')
    .ilike('full_name', `%${name}%`)
    .limit(1)
  if (error) {
    console.error('Error searching alumni:', error.message)
    return null
  }
  return data?.[0] ?? null
}

async function linkInterviews() {
  console.log('\n=== Linking interviews ===')

  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('id, title, alumni_id')
  if (error) throw error

  let matched = 0
  let missed = 0

  for (const interview of interviews) {
    // Format: "Entrevista: Name Here"
    const name = interview.title?.replace(/^Entrevista:\s*/i, '').trim()
    if (!name) {
      console.log(`  SKIP  [no name] "${interview.title}"`)
      missed++
      continue
    }

    const alumni = await findAlumni(name)
    if (alumni) {
      if (interview.alumni_id === alumni.id) {
        console.log(`  SKIP  [already linked] "${interview.title}" → ${alumni.full_name}`)
        matched++
        continue
      }
      const { error: updateError } = await supabase
        .from('interviews')
        .update({ alumni_id: alumni.id })
        .eq('id', interview.id)
      if (updateError) {
        console.error(`  ERROR "${interview.title}":`, updateError.message)
      } else {
        console.log(`  MATCH "${interview.title}" → ${alumni.full_name} (${alumni.id})`)
        matched++
      }
    } else {
      console.log(`  MISS  "${interview.title}" — no alumni found for "${name}"`)
      missed++
    }
  }

  console.log(`\nInterviews: ${matched} matched, ${missed} missed`)
}

async function linkTrabalhoAlumni() {
  console.log('\n=== Linking trabalho_alumni ===')

  const { data: videos, error } = await supabase
    .from('trabalho_alumni')
    .select('id, title, alumni_id, semester')
  if (error) throw error

  let matched = 0
  let missed = 0

  for (const video of videos) {
    // Format: "Entrevista Calouros Automação XX.X | Name Here"
    // Semester: e.g. "25.1", "22.2"
    const semesterMatch = video.title?.match(/Automa[cç][aã]o\s+(\d{2}\.\d)\s*\|/i)
    const semester = semesterMatch ? semesterMatch[1] : null

    const nameMatch = video.title?.match(/\|\s*(.+)$/)
    const name = nameMatch ? nameMatch[1].trim() : null

    // Update semester if found and not already set
    if (semester && semester !== video.semester) {
      const { error: semErr } = await supabase
        .from('trabalho_alumni')
        .update({ semester })
        .eq('id', video.id)
      if (semErr) {
        console.error(`  ERROR setting semester for "${video.title}":`, semErr.message)
      } else {
        console.log(`  SEMESTER "${video.title}" → ${semester}`)
      }
    }

    if (!name) {
      console.log(`  SKIP  [no name] "${video.title}"`)
      missed++
      continue
    }

    const alumni = await findAlumni(name)
    if (alumni) {
      if (video.alumni_id === alumni.id) {
        console.log(`  SKIP  [already linked] "${video.title}" → ${alumni.full_name}`)
        matched++
        continue
      }
      const { error: updateError } = await supabase
        .from('trabalho_alumni')
        .update({ alumni_id: alumni.id })
        .eq('id', video.id)
      if (updateError) {
        console.error(`  ERROR "${video.title}":`, updateError.message)
      } else {
        console.log(`  MATCH "${video.title}" → ${alumni.full_name} (${alumni.id})`)
        matched++
      }
    } else {
      console.log(`  MISS  "${video.title}" — no alumni found for "${name}"`)
      missed++
    }
  }

  console.log(`\nTrabalho Alumni: ${matched} matched, ${missed} missed`)
}

async function main() {
  await linkInterviews()
  await linkTrabalhoAlumni()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
