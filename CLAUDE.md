# CLAUDE.md — Alumni Automação UFSC

## Project Overview

Alumni network platform for Alumni Automação UFSC (Engenharia de Controle e Automação da UFSC). Static React SPA deployed to UFSC server via SFTP, with Supabase as the full backend.

- **Production URL**: https://alumniautomacao.ufsc.br
- **Repo**: github.com/mvpedro/alumni
- **GitHub Project**: #4 on mvpedro's account
- **Supabase project ref**: vjceckswmormyvcspjyb

## Stack

- React 18 + Vite
- Tailwind CSS + shadcn/ui (New York style, Zinc base)
- Supabase (Postgres, Auth, Storage, RLS)
- TanStack Query for data fetching
- Recharts for charts
- react-markdown + react-helmet-async for blog/SEO
- Sentry for error tracking, PostHog for analytics

## CRITICAL: Security Rules

### NEVER commit secrets to the repository

- **NEVER** hardcode API keys, service role keys, tokens, or passwords in source code or scripts
- All secrets go in `.env` (gitignored) or are passed as environment variables
- Scripts must read from `process.env.SUPABASE_SERVICE_ROLE_KEY` — never inline the key
- Before committing, grep for JWT patterns: `eyJ` prefixes should NEVER appear in tracked files
- The `.env` file is in `.gitignore` — keep it that way

### Secrets management

- **Supabase anon key** (`VITE_SUPABASE_ANON_KEY`): safe for client-side, RLS protects data
- **Supabase service role key** (`SUPABASE_SERVICE_ROLE_KEY`): NEVER in code, only in `.env` and passed to scripts via env var
- **Sentry DSN** (`VITE_SENTRY_DSN`): in `.env` + GitHub Secrets
- **PostHog token** (`VITE_PUBLIC_POSTHOG_PROJECT_TOKEN`): in `.env` + GitHub Secrets
- **Supabase access token** (`SUPABASE_ACCESS_TOKEN`): for CLI only, never committed
- **Resend API key**: configured in Supabase auth settings, never in code
- **SFTP password**: never in code, entered interactively

### Running scripts that need the service key

```bash
SUPABASE_SERVICE_ROLE_KEY="sb_secret_xxx" node scripts/my-script.mjs
```

## Architecture

### Database: Two-table model

- **`profiles`** — auth-only (id FK to auth.users, status, is_admin, user_type). Minimal data.
- **`alumni`** — directory source of truth. All visible data (name, company, location, skills, etc). Linked to profiles via `alumni.profile_id`.

When editing a profile, changes save to `alumni` AND sync `full_name`/`entry_class` back to `profiles`.

### Key tables

- `alumni` — 1100+ alumni records (imported from CSV + registered users)
- `companies` — 180+ companies with sector FK, logo_url
- `sectors` — 14 sectors (Big Tech, Software, Engenharia, etc.)
- `interviews` — blog posts (37 imported from old site)
- `trabalho_alumni` — YouTube video records (65 videos)
- `palestras` — Alumni Talks and event recordings
- `badges` / `alumni_badges` — badge system
- `contact_messages` — contact form inbox

### RLS pattern

- Public read for directory data (alumni, companies, sectors)
- `is_admin()` function for write operations
- `auth.uid()` for own-profile writes
- Contact messages: public insert, admin-only read

### Auth flow

1. User registers → profile created (status='pending') + alumni record auto-created/linked
2. Email auto-confirmed (autoconfirm=true, Resend SMTP for password resets)
3. Admin approves → status='approved' → full access
4. Graduandos register with user_type='graduando'

## Development Workflow

### GitHub Issues first

Always create a GitHub issue on mvpedro/alumni and add it to Project #4 BEFORE starting work. Close the issue when done with a comment describing what was shipped.

### Branching

Currently working directly on `main` for speed. For larger features, use feature branches.

### Deploy

1. `npm run build`
2. `sftp -P 2200 alumniautomacao@nfs.sites.ufsc.br` (requires UFSC VPN, password entered interactively)
3. Delete old `assets/index-*.js` and `assets/index-*.css` from server
4. Upload new `index.html`, `assets/*`, and any new static files to `public_html/`

### Supabase migrations

```bash
# Link (first time)
export SUPABASE_ACCESS_TOKEN="your-token"
npx supabase link --project-ref vjceckswmormyvcspjyb

# Push new migrations
npx supabase db push
```

Migrations are in `supabase/migrations/` numbered sequentially (00001, 00002, etc.).

## Conventions

### Code style

- All imports use `@/` alias (mapped to `src/`)
- Components in `src/components/`, pages in `src/pages/`, hooks in `src/hooks/`
- Use existing shadcn/ui components — don't install new UI libraries
- Portuguese (PT-BR) for all user-facing text
- Toasts via `sonner`: `import { toast } from 'sonner'`
- Auth context: `import { useAuth } from '@/contexts/AuthContext'`

### Data fetching

- TanStack Query for all Supabase queries
- 5-minute staleTime default
- Hooks in `src/hooks/` (useAlumni, useCompanies, useSectors, etc.)
- Mutations invalidate relevant query keys on success

### Naming

- Pages: PascalCase (BancoDeDados.jsx, MapaDosEgressos.jsx)
- Components: PascalCase (AlumniCard.jsx, LogoCluster.jsx)
- Hooks: camelCase with `use` prefix (useAlumni.js, useMapaStats.js)
- Routes: kebab-case (/banco-de-dados, /mapa-dos-egressos, /trabalho-alumni)

### Environment variables

Prefix with `VITE_` for client-side access. Non-VITE vars are server/script only.

```
VITE_SUPABASE_URL=https://vjceckswmormyvcspjyb.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_SENTRY_DSN=...
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=...
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
