/**
 * Automated deploy to UFSC server.
 *
 * Prerequisites:
 *   - Connected to UFSC VPN
 *   - .env has SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASS
 *
 * Usage:
 *   node scripts/deploy.mjs               # build + deploy
 *   node scripts/deploy.mjs --skip-build  # deploy only (assumes dist/ exists)
 */

import { execFileSync } from 'child_process'
import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import SftpClient from 'ssh2-sftp-client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = resolve(ROOT, 'dist')
const REMOTE_DIR = '/public_html'

// ── Load .env ───────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, '.env')
  if (!existsSync(envPath)) {
    console.error('ERROR: .env file not found. Copy .env.example and fill in values.')
    process.exit(1)
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
}

loadEnv()

const SFTP_CONFIG = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT || '2200'),
  username: process.env.SFTP_USER,
  password: process.env.SFTP_PASS,
  readyTimeout: 10000,
  retries: 2,
}

if (!SFTP_CONFIG.host || !SFTP_CONFIG.username || !SFTP_CONFIG.password) {
  console.error('ERROR: Missing SFTP credentials in .env (SFTP_HOST, SFTP_USER, SFTP_PASS)')
  process.exit(1)
}

const skipBuild = process.argv.includes('--skip-build')

// ── Step 1: Build ───────────────────────────────────────────────────────────
if (!skipBuild) {
  console.log('\n🔨 Step 1: Building...')
  try {
    execFileSync('npx', ['vite', 'build'], { cwd: ROOT, stdio: 'inherit' })
  } catch {
    console.error('ERROR: Build failed.')
    process.exit(1)
  }
} else {
  console.log('\n⏭️  Skipping build (--skip-build)')
}

if (!existsSync(DIST)) {
  console.error('ERROR: dist/ directory not found. Run build first.')
  process.exit(1)
}

// ── Step 2: Collect local files ─────────────────────────────────────────────
console.log('\n📦 Step 2: Collecting files to deploy...')

const localFiles = []

// Root files
for (const f of readdirSync(DIST)) {
  const fullPath = resolve(DIST, f)
  if (f === 'assets') continue
  if (statSync(fullPath).isFile()) {
    localFiles.push({ local: fullPath, remote: `${REMOTE_DIR}/${f}` })
  }
}

// .htaccess (hidden file)
const htaccess = resolve(DIST, '.htaccess')
if (existsSync(htaccess)) {
  localFiles.push({ local: htaccess, remote: `${REMOTE_DIR}/.htaccess` })
}

// Assets
const assetsDir = resolve(DIST, 'assets')
if (existsSync(assetsDir)) {
  for (const f of readdirSync(assetsDir)) {
    localFiles.push({
      local: resolve(assetsDir, f),
      remote: `${REMOTE_DIR}/assets/${f}`,
    })
  }
}

console.log(`  ${localFiles.length} files to upload`)

// ── Step 3: Connect and deploy ──────────────────────────────────────────────
console.log(`\n🔌 Step 3: Connecting to ${SFTP_CONFIG.host}:${SFTP_CONFIG.port}...`)
console.log('  Make sure you are connected to the UFSC VPN!\n')

const sftp = new SftpClient()

try {
  await sftp.connect(SFTP_CONFIG)
  console.log('  ✓ Connected\n')

  // Step 3a: Clean old JS/CSS assets
  console.log('🗑️  Cleaning old assets...')
  const remoteAssets = await sftp.list(`${REMOTE_DIR}/assets`)
  const newAssetNames = new Set(readdirSync(assetsDir))
  let cleaned = 0

  for (const file of remoteAssets) {
    if (!newAssetNames.has(file.name) && (file.name.endsWith('.js') || file.name.endsWith('.css'))) {
      await sftp.delete(`${REMOTE_DIR}/assets/${file.name}`)
      console.log(`  Deleted: assets/${file.name}`)
      cleaned++
    }
  }
  console.log(`  ${cleaned} old assets removed\n`)

  // Step 3b: Ensure assets directory exists
  const assetsExists = await sftp.exists(`${REMOTE_DIR}/assets`)
  if (!assetsExists) {
    await sftp.mkdir(`${REMOTE_DIR}/assets`, true)
  }

  // Step 3c: Upload all files
  console.log('📤 Uploading files...')
  let uploaded = 0
  for (const { local, remote } of localFiles) {
    const name = remote.replace(REMOTE_DIR + '/', '')
    process.stdout.write(`  ${name}... `)
    await sftp.fastPut(local, remote)
    console.log('✓')
    uploaded++
  }

  console.log(`\n  ${uploaded} files uploaded`)

} catch (err) {
  if (err.message?.includes('connect') || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    console.error('\n❌ Connection failed. Are you connected to the UFSC VPN?')
  } else {
    console.error(`\n❌ Deploy failed: ${err.message}`)
  }
  process.exit(1)
} finally {
  await sftp.end()
}

console.log('\n✅ Deploy complete!')
console.log('   Check: https://alumniautomacao.ufsc.br')
console.log('   Hard refresh (Ctrl+Shift+R) to see changes.\n')
