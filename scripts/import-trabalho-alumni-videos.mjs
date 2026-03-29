/**
 * Import Trabalho Alumni YouTube videos into the trabalho_alumni Supabase table.
 *
 * Usage:
 *   node scripts/import-trabalho-alumni-videos.mjs
 *
 * The script is idempotent — rows where youtube_url already exists are skipped.
 * Service role key is hardcoded for this one-off import script.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vjceckswmormyvcspjyb.supabase.co'
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Video data — ordered newest first (display_order = index + 1)
// ---------------------------------------------------------------------------

// Each entry: [title, youtubeUrl, type]
// type = 'entrevista' | 'alumnitalks'
const RAW_VIDEOS = [
  // 25.1
  ['Entrevista Calouros Automação 25.1 | Eduardo Nickel', 'https://www.youtube.com/watch?v=SQObePhtHBg', 'entrevista'],
  ['Entrevista Calouros Automação 25.1 | Amanda Souza Machado', 'https://www.youtube.com/watch?v=9Ydz3aYuAOc', 'entrevista'],
  // 23.2
  ['Entrevista Calouros Automação 23.2 | Eduardo Nickel', 'https://www.youtube.com/watch?v=7NUaqAlKn6s', 'entrevista'],
  ['Entrevista Calouros Automação 23.2 | Alex Cani', 'https://www.youtube.com/watch?v=Ti01vNcUb6Q', 'entrevista'],
  ['Entrevista Calouros Automação 23.2 | Joana Alves dos Santos', 'https://www.youtube.com/watch?v=-oLG8OdkXaQ', 'entrevista'],
  // 23.1
  ['Entrevista Calouros Automação 23.1 | Paulo Nishimoto', 'https://www.youtube.com/watch?v=DixNYlWxCJc', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Erich Alves', 'https://www.youtube.com/watch?v=uv3yWCGXCMM', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Hugo Fagundes', 'https://www.youtube.com/watch?v=ptfbxDkMfYc', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Igor Gois', 'https://www.youtube.com/watch?v=R3Yp1V74W8c', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Grégori Daminelli', 'https://www.youtube.com/watch?v=vdFVmlHS954', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Bruno Fontana', 'https://www.youtube.com/watch?v=9Lvh9JGPyjU', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Raphael Beppler', 'https://www.youtube.com/watch?v=vRUwtwNABGA', 'entrevista'],
  ['Entrevista Calouros Automação 23.1 | Fábio Pedrotti Terra', 'https://www.youtube.com/watch?v=1xsuZfuOL7k', 'entrevista'],
  // 22.2
  ['Entrevista Calouros Automação 22.2 | Luciana Bolan Frigo', 'https://www.youtube.com/watch?v=jD3vrLCcExo', 'entrevista'],
  ['Entrevista Calouros Automação 22.2 | Daniel Arantes Bernardes', 'https://www.youtube.com/watch?v=VP4kUMzSjYA', 'entrevista'],
  ['Entrevista Calouros Automação 22.2 | Arthur Bertemes', 'https://www.youtube.com/watch?v=-jbwRT6l57w', 'entrevista'],
  ['Entrevista Calouros Automação 22.2 | Rafael Gonçalves d\'Ávila da Silva', 'https://www.youtube.com/watch?v=KRVFqb6Ui1k', 'entrevista'],
  // AlumniTalk (inserted between 22.2 and rest of 22.2 in the original list ordering)
  ['AlumniTalk - Hugo Fagundes', 'https://www.youtube.com/watch?v=3Tym9_ckBwU', 'alumnitalks'],
  ['Entrevista Calouros Automação 22.2 | Alisson Maia', 'https://www.youtube.com/watch?v=mV79XFfTEr8', 'entrevista'],
  ['Entrevista Calouros Automação 22.2 | Mauricio Reck', 'https://www.youtube.com/watch?v=lD2R5-Fy89k', 'entrevista'],
  ['Entrevista Calouros Automação 22.2 | Guilherme Cornelli', 'https://www.youtube.com/watch?v=iYR9agzmSCc', 'entrevista'],
  // 22.1
  ['Entrevista Calouros Automação 22.1 | Gelson Onir Pasetti', 'https://www.youtube.com/watch?v=UMl7P_nk9-M', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Andjara Consentino', 'https://www.youtube.com/watch?v=HvPXX8DKiUs', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Pedro Casali', 'https://www.youtube.com/watch?v=G_sgqLyRObc', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | André Carvalho Bittencourt', 'https://www.youtube.com/watch?v=tWmyZkQyCyE', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Gustavo Raposo Vieira', 'https://www.youtube.com/watch?v=Jg4OXkCo2C4', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Sacha Geyger Boff', 'https://www.youtube.com/watch?v=BBIVFeKDdS8', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Antônio Sandri Silvestre', 'https://www.youtube.com/watch?v=gEnDCSipX7c', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Manoel Guidi Alvares', 'https://www.youtube.com/watch?v=Q2f7iHQGJq8', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Bruno Rodrigues Battistott', 'https://www.youtube.com/watch?v=MwsTqXMWqbg', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Christian Boava', 'https://www.youtube.com/watch?v=DAo5z5ghSCw', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Marcelo Dalmas', 'https://www.youtube.com/watch?v=IIoWnDn8d1o', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Thalles Rigobello', 'https://www.youtube.com/watch?v=0KF4GANVAW4', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Diego Pereira Dias', 'https://www.youtube.com/watch?v=gC3YOzP3C7s', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Guilherme Espindola Winck', 'https://www.youtube.com/watch?v=Ww5godvVvOw', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Cristian Gunsch Moura', 'https://www.youtube.com/watch?v=LyZfLtrQtEc', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Alice Ferreira Branco', 'https://www.youtube.com/watch?v=cSgVWBIQt4o', 'entrevista'],
  ['Entrevista Calouros Automação 22.1 | Vinicius Andres Strey', 'https://www.youtube.com/watch?v=TTduXjKIPIo', 'entrevista'],
  // 21.2
  ['Entrevista Calouros Automação 21.2 | Luiz Henrique Martins Kleinmayer', 'https://www.youtube.com/watch?v=4KQJ78io64w', 'entrevista'],
  ['Entrevista Calouros Automação 21.2 | Felipe Santos Eberhardt', 'https://www.youtube.com/watch?v=4rQUi_4bo40', 'entrevista'],
  ['Entrevista Calouros Automação 21.2 | André Rocha Silva', 'https://www.youtube.com/watch?v=ImIGKCjZaHo', 'entrevista'],
  ['Entrevista Calouros Automação 21.2 | Amadeu Plácido Neto', 'https://www.youtube.com/watch?v=04dycvnlQIM', 'entrevista'],
  ['Entrevista Calouros Automação 21.2 | Elizabeth Rocha Fernandes', 'https://www.youtube.com/watch?v=Di4meofrGE0', 'entrevista'],
  ['Entrevista Calouros Automação 21.2 | Matheus Sperb Machado', 'https://www.youtube.com/watch?v=5gDyDw_9mVo', 'entrevista'],
  // 21.1
  ['Entrevista Calouros Automação 21.1 | Mônica Masue Murakami', 'https://www.youtube.com/watch?v=Jq7CN41AYR8', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Filipe Macedo de Carvalho', 'https://www.youtube.com/watch?v=5vHyCZpAw8c', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Miguel Zacatei Aveiro', 'https://www.youtube.com/watch?v=DEBnxTDAWH4', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Gustavo Sena Mafra', 'https://www.youtube.com/watch?v=9FsOgR2RwKA', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Renan Capaverde', 'https://www.youtube.com/watch?v=uTlV05N2esk', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Tiago Ferreira', 'https://www.youtube.com/watch?v=UTQQaf6tVW8', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Luiz Henrique Reis de Castilho Stival', 'https://www.youtube.com/watch?v=KSUbbZ7pvN0', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Ricardo Hoffmann', 'https://www.youtube.com/watch?v=4sn4FcuLz4o', 'entrevista'],
  ['Entrevista Calouros Automação 21.1 | Mateus Abreu de Andrade', 'https://www.youtube.com/watch?v=aZoyD1Vu1Qs', 'entrevista'],
  // 20.2
  ['Entrevista Calouros Automação 20.2 | Renato Bock da Costa', 'https://www.youtube.com/watch?v=cnnwHFZZBns', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Michael Camilo', 'https://www.youtube.com/watch?v=0xl-PjN4SJM', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | José Luiz Bittencourt', 'https://www.youtube.com/watch?v=5qknVnIsBQI', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Thiago Bacic', 'https://www.youtube.com/watch?v=ik7jRljL1Tc', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Mariana Becker', 'https://www.youtube.com/watch?v=PH8jaaeJAL0', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Musa Morena Marcusso Manhães', 'https://www.youtube.com/watch?v=wTQ4lBJdJKg', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Rodrigo Madruga', 'https://www.youtube.com/watch?v=pYzyx3rHsQE', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Jonatas Pavei', 'https://www.youtube.com/watch?v=xbfC74Y7dQQ', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Eduardo Bombieri', 'https://www.youtube.com/watch?v=cKIAdAPjMQ0', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Cassiano Bonin', 'https://www.youtube.com/watch?v=nhcP1EjuSBk', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Carlos Eduardo Knippschild', 'https://www.youtube.com/watch?v=NSqnKpfxIqA', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | Edson Menegatti', 'https://www.youtube.com/watch?v=Ckq0U4mlzqE', 'entrevista'],
  ['Entrevista Calouros Automação 20.2 | João de Moraes Paludo', 'https://www.youtube.com/watch?v=dBgUwXhZAiY', 'entrevista'],
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract video ID from a YouTube URL and return a clean watch URL. */
function cleanYouTubeUrl(url) {
  const match = url.match(/[?&]v=([^&]+)/)
  if (!match) return url
  return `https://www.youtube.com/watch?v=${match[1]}`
}

/** Return the standard YouTube thumbnail URL for a video ID. */
function thumbnailUrl(url) {
  const match = url.match(/[?&]v=([^&]+)/)
  if (!match) return null
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
}

/**
 * Build a description string from the title.
 *
 * "Entrevista Calouros Automação 22.2 | Rafael Gonçalves d'Ávila da Silva"
 *   → semester = "22.2", name = "Rafael Gonçalves d'Ávila da Silva"
 *   → "Entrevista realizada pelos calouros do semestre 22.2 com o egresso Rafael Gonçalves d'Ávila da Silva."
 *
 * "AlumniTalk - Hugo Fagundes"
 *   → "AlumniTalk com o egresso Hugo Fagundes."
 */
function buildDescription(title, type) {
  if (type === 'alumnitalks') {
    // "AlumniTalk - Hugo Fagundes"
    const name = title.replace(/^AlumniTalk\s*-\s*/, '').trim()
    return `AlumniTalk com o egresso ${name}.`
  }

  // "Entrevista Calouros Automação 22.2 | Rafael Gonçalves d'Ávila da Silva"
  const match = title.match(/Automação\s+([\d.]+)\s*\|\s*(.+)$/)
  if (!match) return ''
  const [, semester, name] = match
  return `Entrevista realizada pelos calouros do semestre ${semester} com o egresso ${name.trim()}.`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Trabalho Alumni Videos Import ===')
  console.log(`Total videos to process: ${RAW_VIDEOS.length}`)

  // Fetch existing youtube_urls for idempotency
  const { data: existing, error: fetchError } = await supabase
    .from('trabalho_alumni')
    .select('youtube_url')

  if (fetchError) {
    console.error('ERROR: could not fetch existing videos:', fetchError.message)
    process.exit(1)
  }

  const existingUrls = new Set((existing || []).map((r) => r.youtube_url))
  console.log(`Found ${existingUrls.size} existing records in DB`)

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < RAW_VIDEOS.length; i++) {
    const [title, rawUrl, type] = RAW_VIDEOS[i]
    const youtube_url = cleanYouTubeUrl(rawUrl)
    const display_order = i + 1

    if (existingUrls.has(youtube_url)) {
      console.log(`  SKIP [${display_order}] ${title}`)
      skipped++
      continue
    }

    const record = {
      title,
      description: buildDescription(title, type),
      youtube_url,
      thumbnail_url: thumbnailUrl(rawUrl),
      display_order,
      published: true,
    }

    const { error: insertError } = await supabase.from('trabalho_alumni').insert(record)

    if (insertError) {
      console.error(`  ERROR [${display_order}] ${title}: ${insertError.message}`)
      errors++
    } else {
      console.log(`  OK    [${display_order}] ${title}`)
      inserted++
      existingUrls.add(youtube_url)
    }
  }

  console.log('\n=== Import complete ===')
  console.log(`  Inserted : ${inserted}`)
  console.log(`  Skipped  : ${skipped}`)
  console.log(`  Errors   : ${errors}`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
