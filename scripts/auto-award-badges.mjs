/**
 * Auto-award badges to alumni who already have linked content.
 *
 * Awards:
 *   - "entrevistado" → alumni with linked interviews
 *   - "trabalho-alumni" → alumni with linked trabalho_alumni videos
 *   - "mentor" → alumni with open_to_mentoring = true
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vjceckswmormyvcspjyb.supabase.co'
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function getBadgeId(slug) {
  const { data, error } = await supabase
    .from('badges')
    .select('id')
    .eq('slug', slug)
    .single()
  if (error) throw new Error(`Badge not found: ${slug} — ${error.message}`)
  return data.id
}

async function awardBadge(alumniId, badgeId, badgeSlug) {
  const { error } = await supabase
    .from('alumni_badges')
    .insert({ alumni_id: alumniId, badge_id: badgeId })

  if (error) {
    // unique constraint → already awarded
    if (error.code === '23505') return false
    throw error
  }
  return true
}

async function run() {
  console.log('Fetching badge IDs...')
  const [entrevistadoId, trabalhoAlumniId, mentorId] = await Promise.all([
    getBadgeId('entrevistado'),
    getBadgeId('trabalho-alumni'),
    getBadgeId('mentor'),
  ])

  let totalAwarded = 0

  // ── Entrevistado ──────────────────────────────────────────
  console.log('\nQuerying alumni with interviews...')
  const { data: interviewAlumni, error: iErr } = await supabase
    .from('interviews')
    .select('alumni_id')
    .not('alumni_id', 'is', null)

  if (iErr) throw iErr

  const uniqueInterviewAlumni = [...new Set(interviewAlumni.map((r) => r.alumni_id))]
  console.log(`  Found ${uniqueInterviewAlumni.length} alumni with interviews`)

  for (const alumniId of uniqueInterviewAlumni) {
    const awarded = await awardBadge(alumniId, entrevistadoId, 'entrevistado')
    if (awarded) {
      totalAwarded++
      console.log(`  + Awarded "entrevistado" to ${alumniId}`)
    }
  }

  // ── Trabalho Alumni ───────────────────────────────────────
  console.log('\nQuerying alumni with trabalho_alumni videos...')
  const { data: trabalhoAlumni, error: tErr } = await supabase
    .from('trabalho_alumni')
    .select('alumni_id')
    .not('alumni_id', 'is', null)

  if (tErr) throw tErr

  const uniqueTrabalhoAlumni = [...new Set(trabalhoAlumni.map((r) => r.alumni_id))]
  console.log(`  Found ${uniqueTrabalhoAlumni.length} alumni with trabalho alumni videos`)

  for (const alumniId of uniqueTrabalhoAlumni) {
    const awarded = await awardBadge(alumniId, trabalhoAlumniId, 'trabalho-alumni')
    if (awarded) {
      totalAwarded++
      console.log(`  + Awarded "trabalho-alumni" to ${alumniId}`)
    }
  }

  // ── Mentor ────────────────────────────────────────────────
  console.log('\nQuerying alumni with open_to_mentoring = true...')
  const { data: mentorAlumni, error: mErr } = await supabase
    .from('alumni')
    .select('id')
    .eq('open_to_mentoring', true)

  if (mErr) throw mErr

  console.log(`  Found ${mentorAlumni.length} alumni open to mentoring`)

  for (const { id: alumniId } of mentorAlumni) {
    const awarded = await awardBadge(alumniId, mentorId, 'mentor')
    if (awarded) {
      totalAwarded++
      console.log(`  + Awarded "mentor" to ${alumniId}`)
    }
  }

  console.log(`\nDone! Total new badges awarded: ${totalAwarded}`)
}

run().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
