# Alumni Automação UFSC — Platform Design Spec

## Overview

Institutional alumni network platform for Alumni Automação UFSC. Static React SPA deployed to UFSC server (Apache, static files only, FTP deploy via VPN). Supabase as the full backend (Postgres, Auth, Storage, RLS).

The platform allows alumni to register, build profiles, and browse a directory of fellow graduates. Admins manage content and approve registrations. Public-facing pages include a landing page, alumni map with stats, blog interviews, and student interview recordings.

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Vite | Static build, modern DX |
| Routing | React Router | Client-side SPA routing |
| Styling | Tailwind CSS | Utility-first, consistent |
| UI Components | shadcn/ui + Radix | Accessible, minimal, owned code |
| Data Fetching | TanStack Query | Caching, pagination, loading states |
| Backend / DB | Supabase (Postgres) | Auto REST API, zero backend |
| Auth | Supabase Auth | Email/password registration |
| Storage | Supabase Storage | Avatars, logos, blog covers |
| Security | Row Level Security (RLS) | Access control at DB level |
| Charts | Recharts | Lightweight, React-native |
| Pre-rendering | vite-ssg | Static HTML for blog SEO |
| CI | GitHub Actions | Build + artifact generation |
| Deploy | FTP (manual, VPN required) | UFSC server constraint |

## Visual Identity

- Logo: Alumni Automação UFSC graduation cap (teal/turquoise)
- Primary color: teal (to match the logo, replacing the old Mantine blue)
- Style: clean, minimal, mobile-first
- Language: Portuguese (PT-BR) only

## Database Schema

### profiles

| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users, PK |
| full_name | text | Required |
| entry_class | text | Format "YYYY.S" (e.g. "2017.2") |
| graduation_class | text, nullable | Null if still studying |
| bio | text, nullable | |
| avatar_url | text, nullable | Supabase Storage URL |
| company_id | uuid, nullable | FK → companies |
| job_title | text, nullable | |
| city | text, nullable | |
| state | text, nullable | |
| country | text | Default "Brasil" |
| linkedin_url | text, nullable | |
| contact_email | text, nullable | |
| skills | text[], nullable | Tags |
| career_history | jsonb, nullable | [{company_name, company_id?, title, start_year, end_year}] — years as integers, end_year null if current |
| interests | text[], nullable | |
| open_to_mentoring | boolean | Default false |
| open_to_contact | boolean | Default false |
| status | text | 'pending' / 'approved' / 'rejected' |
| is_admin | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### companies

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Unique |
| logo_url | text, nullable | Supabase Storage |
| sector_id | uuid | FK → sectors |
| website | text, nullable | |
| status | text | 'approved' / 'pending' |
| submitted_by | uuid, nullable | FK → profiles (phase 2) |
| created_at | timestamptz | |

### sectors

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Unique |
| display_order | int | For UI ordering |

Seed values from reference image: Fábrica e Indústria, Big Tech, Energia, Governo, Startups, Engenharia, Serviços, Automotivo, Aeroespacial, Mercado Financeiro, Software, Ensino e Pesquisa, Consultoria, Revista Federal.

### interviews

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| slug | text | Unique, for SEO URLs |
| content | text | Markdown |
| excerpt | text | |
| cover_image_url | text, nullable | |
| author_id | uuid | FK → profiles |
| published | boolean | Default false |
| published_at | timestamptz, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### trabalho_alumni

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| description | text, nullable | |
| youtube_url | text | |
| thumbnail_url | text, nullable | |
| display_order | int | For UI ordering |
| published | boolean | Default true |
| created_at | timestamptz | |

### contact_messages

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| email | text | |
| message | text | |
| read | boolean | Default false |
| created_at | timestamptz | |

## RLS Policies

| Table | Read | Write |
|---|---|---|
| profiles | Approved profiles: fully public (all columns). Pending/rejected: only own profile. | Own profile only. Admins: all. |
| companies | Public (approved only) | Admins. Phase 2: authenticated insert (status='pending') |
| sectors | Public | Admins only |
| interviews | Public (published only) | Admins only |
| trabalho_alumni | Public (published only) | Admins only |
| contact_messages | Admins only | Public insert (anyone can send) |

Note: Approved profiles are fully public (all columns). RLS operates at the row level, not column level, so column-level restriction would require a Postgres view or Edge Function — unnecessary complexity for this use case. Users control their own privacy by choosing which optional fields to fill.

## Auth Flow

1. User visits `/cadastro`, fills: name, email, password, entry_class, graduation_class (optional)
2. Supabase Auth creates user in `auth.users`
3. DB trigger auto-creates `profiles` row with `status = 'pending'`
4. User sees confirmation: "Conta criada! Aguarde aprovação de um administrador."
5. User can log in and edit their own profile, but cannot access the directory
6. Admin sees pending count on dashboard, approves → `status = 'approved'`
7. User now has full access to Banco de Dados, Mapa, and other profiles

### Auth States & Access

| State | Can see | Can do |
|---|---|---|
| Anonymous | Landing, Entrevistas, Trabalho Alumni, Contato, Mapa (public stats) | Submit contact form, register |
| Authenticated + pending | All public + own profile edit | Edit own profile |
| Authenticated + approved | All public + Banco de Dados, full Mapa, other profiles | All above |
| Admin | Everything | CRUD all content, approve/reject users, manage companies/sectors |

### Admin Bootstrap

First admin is set manually via Supabase dashboard (`is_admin = true`). After that, existing admins can promote others from the admin panel.

## Routes

```
/                       → Landing page (public)
/login                  → Login (public)
/cadastro               → Registration (public)
/contato                → Contact form (public)
/entrevistas            → Blog listing (public, pre-rendered)
/entrevistas/:slug      → Blog post (public, pre-rendered)
/trabalho-alumni        → YouTube videos grid (public)
/banco-de-dados         → Alumni directory (authenticated + approved)
/mapa-dos-egressos      → Dashboard + logo map (public stats, full detail authenticated)
/perfil                 → Own profile edit (authenticated)
/perfil/:id             → View someone's profile (authenticated + approved)
/admin                  → Admin dashboard (admin only)
/admin/usuarios         → Manage users / approve registrations
/admin/empresas         → Manage companies + logos
/admin/entrevistas      → CRUD blog posts
/admin/trabalho-alumni  → Manage YouTube videos
/admin/contato          → Read contact messages
/admin/setores          → Manage sectors
```

## Page Details

### Landing Page
Hero with Alumni logo + tagline. Quick stats (X alumni, Y companies, Z sectors). Featured sections linking to Mapa, Entrevistas, Banco de Dados. CTA to register.

### Banco de Dados
Search bar + filter sidebar (sector, company, city, graduation class, skills, open to mentoring). Results as cards: avatar, name, company, class, city. Click to view full profile.

### Mapa dos Egressos

**Stat cards (top):** Total de Egressos, Empresas, Setores, Turmas representadas.

**Charts (Recharts):** Alumni por Setor (horizontal bar/donut), Alumni por Turma (vertical bar), Alumni por Estado/País (horizontal bar). Charts are clickable — clicking a bar/slice filters the logo cluster below.

**Logo cluster grid:** Grouped by sector. Company logos as tiles, size scaled by alumni count (3 tiers: small/medium/large). Clicking a logo shows the alumni at that company. Layout matches the reference image style.

**Public vs authenticated:** Public sees stat cards + charts (aggregated, no names). Authenticated+approved sees full logo grid with clickable drill-down to profiles.

### Entrevistas (Blog)
Card grid: cover image, title, excerpt, date. Paginated. Post page: full markdown content, author info. Pre-rendered as static HTML for SEO.

### Trabalho Alumni
Grid of YouTube embed cards with title and description.

### Perfil
Edit form for all profile fields. Company selection via searchable dropdown. Skills/interests as tag inputs. Career history as repeatable group (add/remove entries).

### Admin Panel
Sidebar nav. Dashboard with pending approvals count, unread messages, content stats. Sub-pages are CRUD tables with search. Blog editor: title, auto-slug, markdown content, cover image upload, publish/draft. Inline actions where possible (one-click approve user).

## Shared Components

```
Layout/
├── Navbar              — logo, nav links, auth state, mobile hamburger
├── Footer              — links, social
├── AdminLayout         — sidebar + content area
├── ProtectedRoute      — redirects unauthenticated users
├── ApprovedRoute       — redirects pending/rejected users

UI/ (shadcn/ui based)
├── FilterSidebar       — reusable multi-filter panel
├── SearchBar           — debounced search input
├── DataCard            — alumni card, interview card, video card
├── StatCard            — number + label + optional icon
├── LogoCluster         — sector-grouped logo grid for Mapa
├── TagInput            — for skills/interests
├── RichTextEditor      — markdown editor for blog posts (admin)
├── YouTubeEmbed        — responsive YouTube iframe wrapper
├── Pagination          — cursor or offset-based
```

## Pre-rendering Strategy (SEO)

vite-ssg pre-renders blog routes at build time:

1. At build, vite-ssg queries Supabase for all published interview slugs
2. Each `/entrevistas/:slug` route gets a fully rendered HTML file
3. SEO meta tags injected per post: title, description, og:image, og:type
4. Non-blog routes get static pre-rendering with basic meta tags
5. SPA hydrates on top after load — static HTML for crawlers, live SPA for users

### Triggering rebuilds

Phase 1: manual — admin clicks "Run workflow" in GitHub Actions after publishing a post.
Future: Supabase webhook → GitHub Actions API for automatic rebuild on publish.

## Local Development

Developers run the app locally against a Supabase instance:

1. Clone the repo, `npm install`
2. Copy `.env.example` → `.env` with Supabase credentials (shared dev project or local Supabase via `supabase start`)
3. `npm run dev` — Vite dev server with hot reload
4. Supabase local dev (optional): `npx supabase start` spins up a local Postgres + Auth + Storage via Docker. Migrations in `supabase/migrations/` are applied automatically. This allows offline development and safe schema iteration without touching the shared project.

### .env.example

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJ...local-anon-key...
```

## Deploy Pipeline

```
Developer pushes to main
    → GitHub Action:
        1. npm ci
        2. npm run build (vite-ssg)
        3. Upload dist/ as artifact
    → Developer (on UFSC VPN):
        1. Downloads artifact (gh run download)
        2. FTPs dist/ to UFSC server (lftp mirror)
```

### deploy.sh (local, requires VPN)

```bash
#!/bin/bash
gh run download --name dist -D ./dist
lftp -c "open ftp://user@alumni.automacao.ufsc.br; mirror -R ./dist /"
```

### Apache .htaccess (in public/)

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Supabase Project Setup

1. Create new Supabase project (free tier)
2. Save project URL + anon key → `.env` (gitignored) + GitHub Secrets
3. Run initial migration (all tables + RLS policies)
4. Seed sectors table with values from reference image
5. Create Storage buckets: `avatars`, `company-logos`, `blog-covers`
6. Storage policies: public read all buckets, authenticated write for `avatars`, admin write for `company-logos` and `blog-covers`

### Environment Variables

```
VITE_SUPABASE_URL=https://xyzproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Both safe to expose in client — RLS protects data.

## Phasing

### Phase 1 — Core MVP

| Slice | Delivers |
|---|---|
| 1.1 Project scaffold | Vite + React + Tailwind + shadcn/ui + Supabase client, routing skeleton, .htaccess, CI build action |
| 1.2 Supabase setup | Create project, migrations (all tables), seed sectors, RLS policies, Storage buckets |
| 1.3 Auth + profiles | Registration, login, profile edit, pending state, route guards |
| 1.4 Admin panel | Admin layout, user management (approve/reject/promote), companies CRUD, sectors CRUD |
| 1.5 Banco de Dados | Alumni directory with search + filters, profile view page |
| 1.6 Mapa dos Egressos | Stat cards, charts, logo cluster grid (admin-curated logos) |
| 1.7 Landing page | Hero, stats, featured sections, CTAs |
| 1.8 Contato | Contact form + admin inbox |

### Phase 2 — Content & SEO

| Slice | Delivers |
|---|---|
| 2.1 Entrevistas blog | Admin editor, blog listing/post pages, vite-ssg pre-rendering, SEO meta tags |
| 2.2 Trabalho Alumni | YouTube video management + public grid page |
| 2.3 User-submitted logos | User suggests company + logo, admin approval flow |
| 2.4 Polish | Mobile refinements, loading/empty/error states, 404 page |

### Phase 3 — Engagement & Gamification (future)

| Slice | Delivers |
|---|---|
| 3.1 Program invitations | Admins invite alumni to participate in programs (Trabalho Alumni recordings, blog interviews, events) |
| 3.2 Badges system | Alumni earn badges for participation (e.g. "Entrevistado", "Trabalho Alumni", "Participou de Evento"). Badges displayed on profile. |
| 3.3 Events | Event creation, RSVP, attendance tracking, tied to badge rewards |
| 3.4 Alumni engagement dashboard | Admin view of participation metrics, most active alumni, badge distribution |

## Repository Structure

```
alumni/
├── public/
│   ├── .htaccess
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/          — Navbar, Footer, AdminLayout, ProtectedRoute, ApprovedRoute
│   │   ├── ui/              — shadcn/ui components
│   │   ├── alumni/          — DataCard, FilterSidebar, SearchBar
│   │   ├── mapa/            — StatCard, LogoCluster, charts
│   │   ├── blog/            — PostCard, PostContent
│   │   └── admin/           — CRUD tables, forms, editors
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Cadastro.jsx
│   │   ├── Contato.jsx
│   │   ├── BancoDeDados.jsx
│   │   ├── MapaDosEgressos.jsx
│   │   ├── Entrevistas.jsx
│   │   ├── EntrevistaPost.jsx
│   │   ├── TrabalhoAlumni.jsx
│   │   ├── Perfil.jsx
│   │   ├── PerfilView.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Usuarios.jsx
│   │       ├── Empresas.jsx
│   │       ├── EntrevistasAdmin.jsx
│   │       ├── TrabalhoAlumniAdmin.jsx
│   │       ├── Contato.jsx
│   │       └── Setores.jsx
│   ├── hooks/               — useAuth, useProfile, useAlumni, useCompanies, etc.
│   ├── lib/
│   │   └── supabase.js      — Supabase client init
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/           — SQL migrations (tables, RLS, triggers, seeds)
├── .env.example
├── .github/
│   └── workflows/
│       └── build.yml
├── package.json
├── vite.config.js
├── tailwind.config.js
└── deploy.sh
```
