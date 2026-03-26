# Alumni Automação UFSC — Phase 1 Core MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core alumni platform MVP — auth, profiles, alumni directory, admin panel, mapa dos egressos, landing page, and contact form.

**Architecture:** Static React SPA (Vite) with Supabase as backend (Postgres, Auth, Storage, RLS). SPA deployed as static files to UFSC Apache server. All data access through supabase-js client SDK, cached with TanStack Query.

**Tech Stack:** React 18, Vite, Tailwind CSS, shadcn/ui (Radix), TanStack Query, Supabase (supabase-js), Recharts, React Router v6

**Spec:** `docs/superpowers/specs/2026-03-26-alumni-platform-design.md`

---

## File Structure

```
alumni/
├── public/
│   ├── .htaccess
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          — top nav, logo, links, auth state, mobile menu
│   │   │   ├── Footer.jsx          — footer links
│   │   │   ├── AdminLayout.jsx     — sidebar + content wrapper for /admin/*
│   │   │   ├── ProtectedRoute.jsx  — redirects to /login if not authenticated
│   │   │   └── ApprovedRoute.jsx   — redirects to /perfil if not approved
│   │   ├── ui/                     — shadcn/ui components (auto-generated)
│   │   ├── alumni/
│   │   │   ├── AlumniCard.jsx      — card for directory listing
│   │   │   ├── AlumniFilters.jsx   — filter sidebar for Banco de Dados
│   │   │   └── ProfileForm.jsx     — reusable profile edit form
│   │   ├── mapa/
│   │   │   ├── StatCard.jsx        — stat number + label
│   │   │   ├── LogoCluster.jsx     — sector-grouped logo grid
│   │   │   └── MapaCharts.jsx      — Recharts charts (sector, class, geography)
│   │   ├── admin/
│   │   │   ├── DataTable.jsx       — reusable CRUD table with search
│   │   │   ├── UserActions.jsx     — approve/reject/promote inline actions
│   │   │   ├── CompanyForm.jsx     — create/edit company + logo upload
│   │   │   └── SectorForm.jsx      — create/edit sector
│   │   └── common/
│   │       ├── SearchBar.jsx       — debounced search input
│   │       ├── TagInput.jsx        — tag input for skills/interests
│   │       ├── Pagination.jsx      — offset-based pagination
│   │       └── YouTubeEmbed.jsx    — responsive iframe wrapper
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Cadastro.jsx
│   │   ├── Contato.jsx
│   │   ├── BancoDeDados.jsx
│   │   ├── MapaDosEgressos.jsx
│   │   ├── Perfil.jsx              — edit own profile
│   │   ├── PerfilView.jsx          — view someone else's profile
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Usuarios.jsx
│   │       ├── Empresas.jsx
│   │       ├── Setores.jsx
│   │       └── ContatoAdmin.jsx
│   ├── hooks/
│   │   ├── useAuth.js              — auth state, login, logout, register
│   │   ├── useProfile.js           — own profile CRUD
│   │   ├── useAlumni.js            — directory queries with filters
│   │   ├── useCompanies.js         — companies CRUD
│   │   ├── useSectors.js           — sectors CRUD
│   │   ├── useContactMessages.js   — contact messages CRUD
│   │   └── useMapaStats.js         — aggregated stats for Mapa
│   ├── lib/
│   │   ├── supabase.js             — Supabase client init
│   │   └── queryClient.js          — TanStack Query client
│   ├── App.jsx                     — routes + providers
│   ├── main.jsx                    — entry point
│   └── index.css                   — Tailwind directives + custom vars
├── supabase/
│   ├── migrations/
│   │   ├── 00001_create_sectors.sql
│   │   ├── 00002_create_companies.sql
│   │   ├── 00003_create_profiles.sql
│   │   ├── 00004_create_interviews.sql
│   │   ├── 00005_create_trabalho_alumni.sql
│   │   ├── 00006_create_contact_messages.sql
│   │   ├── 00007_rls_policies.sql
│   │   ├── 00008_profile_trigger.sql
│   │   └── 00009_seed_sectors.sql
│   └── config.toml                 — local Supabase config
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── build.yml
├── components.json                 — shadcn/ui config
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── deploy.sh
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `public/.htaccess`, `.env.example`, `.gitignore`, `.github/workflows/build.yml`, `components.json`

- [ ] **Step 1: Initialize Vite + React project**

```bash
npm create vite@latest . -- --template react
```

Accept overwrite prompts (only briefing.md and docs/ exist). This creates `package.json`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, etc.

- [ ] **Step 2: Install core dependencies**

```bash
npm install react-router-dom @supabase/supabase-js @tanstack/react-query recharts
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind**

Replace `src/index.css` with:

```css
@import "tailwindcss";

:root {
  --color-primary: oklch(0.586 0.127 181.912);    /* teal-600 */
  --color-primary-light: oklch(0.841 0.117 181.912); /* teal-200 */
  --color-primary-dark: oklch(0.448 0.119 181.912);  /* teal-800 */
}
```

Update `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables: yes. This creates `components.json` and updates `tailwind.config.js`.

Then add the components we'll need:

```bash
npx shadcn@latest add button card input label textarea select badge dialog dropdown-menu separator sheet table tabs avatar toast sonner
```

- [ ] **Step 5: Set up routing skeleton in App.jsx**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

// Placeholder pages — will be replaced in later tasks
function Placeholder({ name }) {
  return <div className="p-8 text-center text-lg">{name}</div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Placeholder name="Landing" />} />
          <Route path="/login" element={<Placeholder name="Login" />} />
          <Route path="/cadastro" element={<Placeholder name="Cadastro" />} />
          <Route path="/contato" element={<Placeholder name="Contato" />} />
          <Route path="/banco-de-dados" element={<Placeholder name="Banco de Dados" />} />
          <Route path="/mapa-dos-egressos" element={<Placeholder name="Mapa dos Egressos" />} />
          <Route path="/perfil" element={<Placeholder name="Perfil" />} />
          <Route path="/perfil/:id" element={<Placeholder name="Perfil View" />} />
          <Route path="/admin" element={<Placeholder name="Admin Dashboard" />} />
          <Route path="/admin/usuarios" element={<Placeholder name="Admin Usuarios" />} />
          <Route path="/admin/empresas" element={<Placeholder name="Admin Empresas" />} />
          <Route path="/admin/setores" element={<Placeholder name="Admin Setores" />} />
          <Route path="/admin/contato" element={<Placeholder name="Admin Contato" />} />
          <Route path="*" element={<Placeholder name="404 — Página não encontrada" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 6: Create lib files**

`src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

`src/lib/queryClient.js`:

```js
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

- [ ] **Step 7: Create .htaccess, .env.example, .gitignore**

`public/.htaccess`:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

`.env.example`:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

`.gitignore` — ensure these are included (Vite template may already have some):

```
node_modules/
dist/
.env
.env.local
```

- [ ] **Step 8: Create GitHub Actions build workflow**

`.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts at `http://localhost:5173`, shows the placeholder routing. Navigate to `/login`, `/admin`, etc. — each shows its placeholder name.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: project scaffold — Vite + React + Tailwind + shadcn/ui + routing"
```

---

## Task 2: Supabase Setup

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/00001_create_sectors.sql`, `00002_create_companies.sql`, `00003_create_profiles.sql`, `00004_create_interviews.sql`, `00005_create_trabalho_alumni.sql`, `00006_create_contact_messages.sql`, `00007_rls_policies.sql`, `00008_profile_trigger.sql`, `00009_seed_sectors.sql`

**Prerequisites:** Supabase CLI installed (`npm install -g supabase`), Docker running for local dev.

- [ ] **Step 1: Initialize Supabase project locally**

```bash
npx supabase init
```

This creates `supabase/config.toml`. Edit the project name:

```toml
[project]
name = "alumni-automacao-ufsc"
```

- [ ] **Step 2: Create sectors migration**

`supabase/migrations/00001_create_sectors.sql`:

```sql
create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0
);

alter table public.sectors enable row level security;
```

- [ ] **Step 3: Create companies migration**

`supabase/migrations/00002_create_companies.sql`:

```sql
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  sector_id uuid not null references public.sectors(id),
  website text,
  status text not null default 'approved' check (status in ('approved', 'pending')),
  submitted_by uuid,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;
```

- [ ] **Step 4: Create profiles migration**

`supabase/migrations/00003_create_profiles.sql`:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  entry_class text not null,
  graduation_class text,
  bio text,
  avatar_url text,
  company_id uuid references public.companies(id),
  job_title text,
  city text,
  state text,
  country text not null default 'Brasil',
  linkedin_url text,
  contact_email text,
  skills text[],
  career_history jsonb,
  interests text[],
  open_to_mentoring boolean not null default false,
  open_to_contact boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;

-- Now that profiles exists, add FK to companies.submitted_by
alter table public.companies
  add constraint companies_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id);
```

- [ ] **Step 5: Create interviews migration**

`supabase/migrations/00004_create_interviews.sql`:

```sql
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text not null,
  cover_image_url text,
  author_id uuid not null references public.profiles(id),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger on_interview_updated
  before update on public.interviews
  for each row execute function public.handle_updated_at();

alter table public.interviews enable row level security;
```

- [ ] **Step 6: Create trabalho_alumni migration**

`supabase/migrations/00005_create_trabalho_alumni.sql`:

```sql
create table public.trabalho_alumni (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_url text not null,
  thumbnail_url text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.trabalho_alumni enable row level security;
```

- [ ] **Step 7: Create contact_messages migration**

`supabase/migrations/00006_create_contact_messages.sql`:

```sql
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
```

- [ ] **Step 8: Create RLS policies**

`supabase/migrations/00007_rls_policies.sql`:

```sql
-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$ language sql security definer;

-- SECTORS: public read, admin write
create policy "sectors_read" on public.sectors for select using (true);
create policy "sectors_insert" on public.sectors for insert with check (public.is_admin());
create policy "sectors_update" on public.sectors for update using (public.is_admin());
create policy "sectors_delete" on public.sectors for delete using (public.is_admin());

-- COMPANIES: public read (approved), admin write
create policy "companies_read" on public.companies for select using (status = 'approved');
create policy "companies_insert" on public.companies for insert with check (public.is_admin());
create policy "companies_update" on public.companies for update using (public.is_admin());
create policy "companies_delete" on public.companies for delete using (public.is_admin());

-- PROFILES: approved profiles public read, own profile always readable, own profile writable, admin all
create policy "profiles_read_approved" on public.profiles for select using (
  status = 'approved' or id = auth.uid() or public.is_admin()
);
create policy "profiles_insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());
create policy "profiles_delete_admin" on public.profiles for delete using (public.is_admin());

-- INTERVIEWS: public read (published), admin write
create policy "interviews_read" on public.interviews for select using (published = true or public.is_admin());
create policy "interviews_insert" on public.interviews for insert with check (public.is_admin());
create policy "interviews_update" on public.interviews for update using (public.is_admin());
create policy "interviews_delete" on public.interviews for delete using (public.is_admin());

-- TRABALHO_ALUMNI: public read (published), admin write
create policy "trabalho_read" on public.trabalho_alumni for select using (published = true or public.is_admin());
create policy "trabalho_insert" on public.trabalho_alumni for insert with check (public.is_admin());
create policy "trabalho_update" on public.trabalho_alumni for update using (public.is_admin());
create policy "trabalho_delete" on public.trabalho_alumni for delete using (public.is_admin());

-- CONTACT_MESSAGES: public insert, admin read
create policy "contact_insert" on public.contact_messages for insert with check (true);
create policy "contact_read" on public.contact_messages for select using (public.is_admin());
create policy "contact_update" on public.contact_messages for update using (public.is_admin());
create policy "contact_delete" on public.contact_messages for delete using (public.is_admin());
```

- [ ] **Step 9: Create profile auto-creation trigger**

`supabase/migrations/00008_profile_trigger.sql`:

```sql
-- Automatically create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, entry_class)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'entry_class', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 10: Seed sectors**

`supabase/migrations/00009_seed_sectors.sql`:

```sql
insert into public.sectors (name, display_order) values
  ('Fábrica e Indústria', 1),
  ('Big Tech', 2),
  ('Energia', 3),
  ('Governo', 4),
  ('Startups', 5),
  ('Engenharia', 6),
  ('Serviços', 7),
  ('Automotivo', 8),
  ('Aeroespacial', 9),
  ('Mercado Financeiro', 10),
  ('Software', 11),
  ('Ensino e Pesquisa', 12),
  ('Consultoria', 13),
  ('Revista Federal', 14);
```

- [ ] **Step 11: Create storage buckets setup**

This is done via Supabase dashboard or local config. Add to `supabase/config.toml`:

```toml
[storage]
enabled = true

[storage.buckets.avatars]
public = true
file_size_limit = "2MB"
allowed_mime_types = ["image/png", "image/jpeg", "image/webp"]

[storage.buckets.company-logos]
public = true
file_size_limit = "1MB"
allowed_mime_types = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]

[storage.buckets.blog-covers]
public = true
file_size_limit = "5MB"
allowed_mime_types = ["image/png", "image/jpeg", "image/webp"]
```

- [ ] **Step 12: Start local Supabase and verify migrations**

```bash
npx supabase start
```

Expected: Local Supabase starts, all migrations apply successfully. Output shows local URLs and keys. Copy the `anon key` and `API URL` to `.env`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon-key-from-output>
```

Verify in Supabase Studio (http://127.0.0.1:54323): all tables exist, sectors are seeded, RLS is enabled on all tables.

- [ ] **Step 13: Commit**

```bash
git add supabase/ .env.example
git commit -m "feat: Supabase schema — tables, RLS policies, triggers, sector seeds"
```

---

## Task 3: Auth Context & Hooks

**Files:**
- Create: `src/hooks/useAuth.js`, `src/contexts/AuthContext.jsx`
- Modify: `src/App.jsx` (wrap with AuthProvider)

- [ ] **Step 1: Create AuthContext**

`src/contexts/AuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, company:companies(*)')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp({ email, password, fullName, entryClass }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, entry_class: entryClass },
      },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  async function refreshProfile() {
    if (session) await fetchProfile(session.user.id)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthenticated: !!session,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.is_admin === true,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

- [ ] **Step 2: Create route guards**

`src/components/layout/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}
```

`src/components/layout/ApprovedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ApprovedRoute({ children }) {
  const { isAuthenticated, isApproved, loading } = useAuth()

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isApproved) return <Navigate to="/perfil" replace />

  return children
}
```

`src/components/layout/AdminRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
```

- [ ] **Step 3: Wrap App with AuthProvider and apply route guards**

Update `src/App.jsx` — wrap with `AuthProvider`, apply `ProtectedRoute`, `ApprovedRoute`, and `AdminRoute` to their respective routes:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ApprovedRoute } from '@/components/layout/ApprovedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'

function Placeholder({ name }) {
  return <div className="p-8 text-center text-lg">{name}</div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Placeholder name="Landing" />} />
            <Route path="/login" element={<Placeholder name="Login" />} />
            <Route path="/cadastro" element={<Placeholder name="Cadastro" />} />
            <Route path="/contato" element={<Placeholder name="Contato" />} />

            {/* Authenticated */}
            <Route path="/perfil" element={
              <ProtectedRoute><Placeholder name="Perfil" /></ProtectedRoute>
            } />

            {/* Approved */}
            <Route path="/banco-de-dados" element={
              <ApprovedRoute><Placeholder name="Banco de Dados" /></ApprovedRoute>
            } />
            <Route path="/perfil/:id" element={
              <ApprovedRoute><Placeholder name="Perfil View" /></ApprovedRoute>
            } />
            <Route path="/mapa-dos-egressos" element={<Placeholder name="Mapa dos Egressos" />} />

            {/* Admin */}
            <Route path="/admin" element={
              <AdminRoute><Placeholder name="Admin Dashboard" /></AdminRoute>
            } />
            <Route path="/admin/usuarios" element={
              <AdminRoute><Placeholder name="Admin Usuarios" /></AdminRoute>
            } />
            <Route path="/admin/empresas" element={
              <AdminRoute><Placeholder name="Admin Empresas" /></AdminRoute>
            } />
            <Route path="/admin/setores" element={
              <AdminRoute><Placeholder name="Admin Setores" /></AdminRoute>
            } />
            <Route path="/admin/contato" element={
              <AdminRoute><Placeholder name="Admin Contato" /></AdminRoute>
            } />

            <Route path="*" element={<Placeholder name="404 — Página não encontrada" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Verify auth flow works**

```bash
npm run dev
```

Navigate to `/perfil` — should redirect to `/login`. Navigate to `/admin` — should redirect to `/login`. Navigate to `/` — should show Landing placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/ src/components/layout/ src/App.jsx
git commit -m "feat: auth context, route guards (protected, approved, admin)"
```

---

## Task 4: Auth Pages (Login + Registration)

**Files:**
- Create: `src/pages/Login.jsx`, `src/pages/Cadastro.jsx`

- [ ] **Step 1: Create Login page**

`src/pages/Login.jsx`:

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn({ email, password })

    if (error) {
      setError('Email ou senha inválidos.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Acesse sua conta Alumni</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-primary underline">
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create Registration page**

`src/pages/Cadastro.jsx`:

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Cadastro() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    entryClass: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      entryClass: form.entryClass,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Conta criada!</CardTitle>
            <CardDescription>
              Aguarde aprovação de um administrador para acessar o Banco de Dados
              e o Mapa dos Egressos. Enquanto isso, você já pode completar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Ir para Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta no Alumni Automação UFSC</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={updateField('fullName')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={updateField('password')}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryClass">Turma de entrada (ex: 2017.2)</Label>
              <Input
                id="entryClass"
                value={form.entryClass}
                onChange={updateField('entryClass')}
                placeholder="2017.2"
                pattern="\d{4}\.[12]"
                title="Formato: YYYY.1 ou YYYY.2"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Wire pages into App.jsx routes**

Replace the Login and Cadastro placeholder imports in `src/App.jsx`:

```jsx
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
// ... in routes:
<Route path="/login" element={<Login />} />
<Route path="/cadastro" element={<Cadastro />} />
```

- [ ] **Step 4: Verify auth pages**

```bash
npm run dev
```

Navigate to `/login` — form renders. Navigate to `/cadastro` — form renders with entry class validation. Submit registration (with local Supabase running) — check Supabase Studio for new user in `auth.users` and new row in `profiles`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.jsx src/pages/Cadastro.jsx src/App.jsx
git commit -m "feat: login and registration pages"
```

---

## Task 5: Navbar & Footer Layout

**Files:**
- Create: `src/components/layout/Navbar.jsx`, `src/components/layout/Footer.jsx`, `src/components/layout/MainLayout.jsx`
- Modify: `src/App.jsx` (wrap routes with MainLayout)

- [ ] **Step 1: Create Navbar**

`src/components/layout/Navbar.jsx`:

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/mapa-dos-egressos', label: 'Mapa dos Egressos' },
  { to: '/contato', label: 'Contato' },
]

const authedLinks = [
  { to: '/banco-de-dados', label: 'Banco de Dados' },
]

export function Navbar() {
  const { isAuthenticated, isApproved, isAdmin, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = [
    ...publicLinks,
    ...(isAuthenticated && isApproved ? authedLinks : []),
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function NavLinks({ onClick }) {
    return links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        onClick={onClick}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {link.label}
      </Link>
    ))
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          Alumni Automação
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/perfil">
                <Button variant="ghost" size="sm">
                  {profile?.full_name || 'Perfil'}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link to="/cadastro"><Button size="sm">Cadastrar</Button></Link>
            </div>
          )}
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="mt-8 flex flex-col gap-4">
              <NavLinks onClick={() => setOpen(false)} />
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/perfil" onClick={() => setOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Meu Perfil
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setOpen(false) }}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}><Button variant="ghost" size="sm" className="w-full">Entrar</Button></Link>
                  <Link to="/cadastro" onClick={() => setOpen(false)}><Button size="sm" className="w-full">Cadastrar</Button></Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create Footer**

`src/components/layout/Footer.jsx`:

```jsx
export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Alumni Automação — UFSC</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Create MainLayout**

`src/components/layout/MainLayout.jsx`:

```jsx
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Update App.jsx to use MainLayout**

Restructure routes to use `MainLayout` as a layout route. Auth pages (login/cadastro) stay outside the layout since they have their own full-screen design:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ApprovedRoute } from '@/components/layout/ApprovedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'

function Placeholder({ name }) {
  return <div className="p-8 text-center text-lg">{name}</div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth pages — no navbar/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Main layout — navbar + footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Placeholder name="Landing" />} />
              <Route path="/contato" element={<Placeholder name="Contato" />} />
              <Route path="/mapa-dos-egressos" element={<Placeholder name="Mapa dos Egressos" />} />

              <Route path="/perfil" element={
                <ProtectedRoute><Placeholder name="Perfil" /></ProtectedRoute>
              } />
              <Route path="/banco-de-dados" element={
                <ApprovedRoute><Placeholder name="Banco de Dados" /></ApprovedRoute>
              } />
              <Route path="/perfil/:id" element={
                <ApprovedRoute><Placeholder name="Perfil View" /></ApprovedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute><Placeholder name="Admin Dashboard" /></AdminRoute>
              } />
              <Route path="/admin/usuarios" element={
                <AdminRoute><Placeholder name="Admin Usuarios" /></AdminRoute>
              } />
              <Route path="/admin/empresas" element={
                <AdminRoute><Placeholder name="Admin Empresas" /></AdminRoute>
              } />
              <Route path="/admin/setores" element={
                <AdminRoute><Placeholder name="Admin Setores" /></AdminRoute>
              } />
              <Route path="/admin/contato" element={
                <AdminRoute><Placeholder name="Admin Contato" /></AdminRoute>
              } />

              <Route path="*" element={<Placeholder name="404 — Página não encontrada" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Verify layout**

```bash
npm run dev
```

Navigate to `/` — should show Navbar + "Landing" + Footer. Navigate to `/login` — should show login form without Navbar/Footer. Navigate to `/contato` — should show Navbar + "Contato" + Footer. Mobile: resize browser — hamburger menu should appear.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/App.jsx
git commit -m "feat: Navbar, Footer, MainLayout with responsive mobile menu"
```

---

## Task 6: Profile Page

**Files:**
- Create: `src/hooks/useProfile.js`, `src/hooks/useCompanies.js`, `src/hooks/useSectors.js`, `src/components/alumni/ProfileForm.jsx`, `src/components/common/TagInput.jsx`, `src/pages/Perfil.jsx`

- [ ] **Step 1: Create data hooks**

`src/hooks/useProfile.js`:

```js
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useUpdateProfile() {
  const { refreshProfile } = useAuth()

  return useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', (await supabase.auth.getUser()).data.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => refreshProfile(),
  })
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file) => {
      const userId = (await supabase.auth.getUser()).data.user.id
      const ext = file.name.split('.').pop()
      const path = `${userId}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      return data.publicUrl
    },
  })
}
```

`src/hooks/useCompanies.js`:

```js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*, sector:sectors(name)')
        .order('name')

      if (error) throw error
      return data
    },
  })
}
```

`src/hooks/useSectors.js`:

```js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order')

      if (error) throw error
      return data
    },
  })
}
```

- [ ] **Step 2: Create TagInput component**

`src/components/common/TagInput.jsx`:

```jsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

export function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border p-2">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button type="button" onClick={() => removeTag(tag)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
```

- [ ] **Step 3: Create ProfileForm component**

`src/components/alumni/ProfileForm.jsx`:

```jsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TagInput } from '@/components/common/TagInput'
import { useCompanies } from '@/hooks/useCompanies'
import { Switch } from '@/components/ui/switch'

export function ProfileForm({ profile, onSubmit, loading }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    entry_class: profile?.entry_class || '',
    graduation_class: profile?.graduation_class || '',
    bio: profile?.bio || '',
    company_id: profile?.company_id || '',
    job_title: profile?.job_title || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || 'Brasil',
    linkedin_url: profile?.linkedin_url || '',
    contact_email: profile?.contact_email || '',
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    open_to_mentoring: profile?.open_to_mentoring || false,
    open_to_contact: profile?.open_to_contact || false,
  })

  const { data: companies = [] } = useCompanies()

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const data = { ...form }
    if (!data.company_id) data.company_id = null
    if (!data.graduation_class) data.graduation_class = null
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" value={form.full_name} onChange={updateField('full_name')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry_class">Turma de entrada</Label>
          <Input id="entry_class" value={form.entry_class} onChange={updateField('entry_class')}
            pattern="\d{4}\.[12]" title="Formato: YYYY.1 ou YYYY.2" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="graduation_class">Turma de formatura</Label>
          <Input id="graduation_class" value={form.graduation_class} onChange={updateField('graduation_class')}
            pattern="\d{4}\.[12]" title="Formato: YYYY.1 ou YYYY.2" placeholder="Deixe vazio se ainda cursando" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_id">Empresa atual</Label>
          <Select value={form.company_id} onValueChange={(v) => setForm((p) => ({ ...p, company_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Cargo</Label>
          <Input id="job_title" value={form.job_title} onChange={updateField('job_title')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={form.city} onChange={updateField('city')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" value={form.state} onChange={updateField('state')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" value={form.country} onChange={updateField('country')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn</Label>
          <Input id="linkedin_url" type="url" value={form.linkedin_url} onChange={updateField('linkedin_url')}
            placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email de contato</Label>
          <Input id="contact_email" type="email" value={form.contact_email} onChange={updateField('contact_email')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={form.bio} onChange={updateField('bio')} rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Habilidades</Label>
        <TagInput value={form.skills} onChange={(v) => setForm((p) => ({ ...p, skills: v }))}
          placeholder="Pressione Enter para adicionar..." />
      </div>

      <div className="space-y-2">
        <Label>Interesses</Label>
        <TagInput value={form.interests} onChange={(v) => setForm((p) => ({ ...p, interests: v }))}
          placeholder="Pressione Enter para adicionar..." />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <div className="flex items-center gap-2">
          <Switch checked={form.open_to_mentoring}
            onCheckedChange={(v) => setForm((p) => ({ ...p, open_to_mentoring: v }))} />
          <Label>Disponível para mentoria</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.open_to_contact}
            onCheckedChange={(v) => setForm((p) => ({ ...p, open_to_contact: v }))} />
          <Label>Disponível para contato</Label>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar perfil'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Create Perfil page**

`src/pages/Perfil.jsx`:

```jsx
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'
import { ProfileForm } from '@/components/alumni/ProfileForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function Perfil() {
  const { profile } = useAuth()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const publicUrl = await uploadAvatar.mutateAsync(file)
      await updateProfile.mutateAsync({ avatar_url: publicUrl })
      toast.success('Foto atualizada!')
    } catch {
      toast.error('Erro ao enviar foto.')
    }
  }

  async function handleSubmit(data) {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Perfil salvo!')
    } catch {
      toast.error('Erro ao salvar perfil.')
    }
  }

  if (!profile) return null

  const statusLabels = {
    pending: { label: 'Aguardando aprovação', variant: 'secondary' },
    approved: { label: 'Aprovado', variant: 'default' },
    rejected: { label: 'Rejeitado', variant: 'destructive' },
  }

  const statusInfo = statusLabels[profile.status]

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Meu Perfil</CardTitle>
              <CardDescription>Edite suas informações</CardDescription>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Input type="file" accept="image/*" onChange={handleAvatarChange}
                className="max-w-xs" />
              <p className="mt-1 text-xs text-muted-foreground">Máximo 2MB. JPG, PNG ou WebP.</p>
            </div>
          </div>

          <ProfileForm
            profile={profile}
            onSubmit={handleSubmit}
            loading={updateProfile.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Add shadcn switch + sonner (toast), wire Perfil into App.jsx**

```bash
npx shadcn@latest add switch
```

Add `<Toaster />` to `App.jsx`:

```jsx
import { Toaster } from '@/components/ui/sonner'
// ... inside the return, after </BrowserRouter>:
<Toaster />
```

Replace the Perfil placeholder import in `App.jsx`:

```jsx
import Perfil from '@/pages/Perfil'
// ... in routes:
<Route path="/perfil" element={
  <ProtectedRoute><Perfil /></ProtectedRoute>
} />
```

- [ ] **Step 6: Verify profile page**

```bash
npm run dev
```

Register a user, log in, navigate to `/perfil`. Should see the profile form with status badge. Edit fields, save — should show success toast. Upload avatar — should update.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/ src/components/alumni/ src/components/common/ src/pages/Perfil.jsx src/App.jsx
git commit -m "feat: profile page — edit form, avatar upload, tag inputs"
```

---

## Task 7: Admin Layout & Dashboard

**Files:**
- Create: `src/components/layout/AdminLayout.jsx`, `src/pages/admin/Dashboard.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create AdminLayout with sidebar**

`src/components/layout/AdminLayout.jsx`:

```jsx
import { NavLink, Outlet } from 'react-router-dom'
import { Users, Building2, Layers, Mail, LayoutDashboard } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/setores', label: 'Setores', icon: Layers },
  { to: '/admin/contato', label: 'Mensagens', icon: Mail },
]

export function AdminLayout() {
  return (
    <div className="container mx-auto flex gap-6 px-4 py-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-24 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create Dashboard page**

`src/pages/admin/Dashboard.jsx`:

```jsx
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Mail, Clock } from 'lucide-react'

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profiles, pending, companies, messages] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('read', false),
      ])
      return {
        totalProfiles: profiles.count || 0,
        pendingApprovals: pending.count || 0,
        totalCompanies: companies.count || 0,
        unreadMessages: messages.count || 0,
      }
    },
  })

  const cards = [
    { label: 'Total de Alumni', value: stats?.totalProfiles, icon: Users },
    { label: 'Aprovações pendentes', value: stats?.pendingApprovals, icon: Clock, highlight: true },
    { label: 'Empresas', value: stats?.totalCompanies, icon: Building2 },
    { label: 'Mensagens não lidas', value: stats?.unreadMessages, icon: Mail },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Painel Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, highlight }) => (
          <Card key={label} className={highlight && value > 0 ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value ?? '...'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update App.jsx — nest admin routes under AdminLayout**

Replace admin routes in `App.jsx`:

```jsx
import { AdminLayout } from '@/components/layout/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'

// ... inside the MainLayout route, replace admin routes with:
<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="usuarios" element={<Placeholder name="Admin Usuarios" />} />
  <Route path="empresas" element={<Placeholder name="Admin Empresas" />} />
  <Route path="setores" element={<Placeholder name="Admin Setores" />} />
  <Route path="contato" element={<Placeholder name="Admin Contato" />} />
</Route>
```

- [ ] **Step 4: Verify admin layout**

Set a user as admin in Supabase Studio (`is_admin = true`), log in, navigate to `/admin`. Should see sidebar + stat cards. Click sidebar links — each shows placeholder content with sidebar active state.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AdminLayout.jsx src/pages/admin/ src/App.jsx
git commit -m "feat: admin layout with sidebar and dashboard stats"
```

---

## Task 8: Admin User Management

**Files:**
- Create: `src/pages/admin/Usuarios.jsx`, `src/components/admin/UserActions.jsx`

- [ ] **Step 1: Create UserActions component**

`src/components/admin/UserActions.jsx`:

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Check, X, Shield } from 'lucide-react'
import { toast } from 'sonner'

export function UserActions({ user }) {
  const queryClient = useQueryClient()

  const updateUser = useMutation({
    mutationFn: async (updates) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  function approve() {
    updateUser.mutate({ status: 'approved' }, {
      onSuccess: () => toast.success(`${user.full_name} aprovado.`),
    })
  }

  function reject() {
    updateUser.mutate({ status: 'rejected' }, {
      onSuccess: () => toast.success(`${user.full_name} rejeitado.`),
    })
  }

  function toggleAdmin() {
    updateUser.mutate({ is_admin: !user.is_admin }, {
      onSuccess: () => toast.success(
        user.is_admin ? `Admin removido de ${user.full_name}.` : `${user.full_name} agora é admin.`
      ),
    })
  }

  return (
    <div className="flex items-center gap-1">
      {user.status === 'pending' && (
        <>
          <Button size="sm" variant="ghost" onClick={approve} title="Aprovar">
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={reject} title="Rejeitar">
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.status !== 'approved' && (
            <DropdownMenuItem onClick={approve}>Aprovar</DropdownMenuItem>
          )}
          {user.status !== 'rejected' && (
            <DropdownMenuItem onClick={reject}>Rejeitar</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={toggleAdmin}>
            <Shield className="mr-2 h-4 w-4" />
            {user.is_admin ? 'Remover admin' : 'Tornar admin'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

- [ ] **Step 2: Create Usuarios page**

`src/pages/admin/Usuarios.jsx`:

```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserActions } from '@/components/admin/UserActions'

const statusVariants = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

const statusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export default function Usuarios() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const filtered = users.filter((u) => {
    const matchesSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.contact_email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Usuários</h1>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.entry_class}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[user.status]}>{statusLabels[user.status]}</Badge>
                </TableCell>
                <TableCell>{user.is_admin ? '✓' : ''}</TableCell>
                <TableCell className="text-right">
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire into App.jsx**

```jsx
import Usuarios from '@/pages/admin/Usuarios'
// ... in admin routes:
<Route path="usuarios" element={<Usuarios />} />
```

- [ ] **Step 4: Verify user management**

Navigate to `/admin/usuarios`. Should show the table with all users. Filter by "Pendentes". Click approve — status changes. Click the dropdown — toggle admin works.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/Usuarios.jsx src/components/admin/UserActions.jsx src/App.jsx
git commit -m "feat: admin user management — list, search, filter, approve, reject, promote"
```

---

## Task 9: Admin Companies & Sectors CRUD

**Files:**
- Create: `src/pages/admin/Empresas.jsx`, `src/pages/admin/Setores.jsx`, `src/components/admin/CompanyForm.jsx`, `src/components/admin/SectorForm.jsx`
- Modify: `src/hooks/useCompanies.js`, `src/hooks/useSectors.js`

- [ ] **Step 1: Extend hooks with mutations**

Add to `src/hooks/useCompanies.js`:

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*, sector:sectors(id, name)')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, sector_id, website, logoFile }) => {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name, sector_id, website, status: 'approved' })
        .select()
        .single()
      if (error) throw error

      if (logoFile) {
        const path = `${data.id}.${logoFile.name.split('.').pop()}`
        await supabase.storage.from('company-logos').upload(path, logoFile)
        const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(path)
        await supabase.from('companies').update({ logo_url: urlData.publicUrl }).eq('id', data.id)
      }
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase.from('companies').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}
```

Add to `src/hooks/useSectors.js`:

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order')
      if (error) throw error
      return data
    },
  })
}

export function useCreateSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, display_order }) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert({ name, display_order })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sectors'] }),
  })
}

export function useUpdateSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase.from('sectors').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sectors'] }),
  })
}

export function useDeleteSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('sectors').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sectors'] }),
  })
}
```

- [ ] **Step 2: Create CompanyForm dialog**

`src/components/admin/CompanyForm.jsx`:

```jsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSectors } from '@/hooks/useSectors'

export function CompanyForm({ open, onOpenChange, onSubmit, loading, initial }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    sector_id: initial?.sector_id || initial?.sector?.id || '',
    website: initial?.website || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const { data: sectors = [] } = useSectors()

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ ...form, logoFile })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Setor</Label>
            <Select value={form.sector_id} onValueChange={(v) => setForm((p) => ({ ...p, sector_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input type="url" value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0])} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create Empresas admin page**

`src/pages/admin/Empresas.jsx`:

```jsx
import { useState } from 'react'
import { useCompanies, useCreateCompany, useDeleteCompany } from '@/hooks/useCompanies'
import { CompanyForm } from '@/components/admin/CompanyForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Empresas() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const { data: companies = [] } = useCompanies()
  const createCompany = useCreateCompany()
  const deleteCompany = useDeleteCompany()

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(data) {
    try {
      await createCompany.mutateAsync(data)
      setFormOpen(false)
      toast.success('Empresa criada!')
    } catch {
      toast.error('Erro ao criar empresa.')
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Excluir ${name}?`)) return
    try {
      await deleteCompany.mutateAsync(id)
      toast.success('Empresa excluída.')
    } catch {
      toast.error('Erro ao excluir. Verifique se não há alumni vinculados.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={() => setFormOpen(true)}><Plus className="mr-2 h-4 w-4" />Nova empresa</Button>
      </div>

      <Input placeholder="Buscar empresa..." value={search}
        onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.logo_url} />
                    <AvatarFallback>{c.name[0]}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.sector?.name}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id, c.name)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CompanyForm open={formOpen} onOpenChange={setFormOpen}
        onSubmit={handleCreate} loading={createCompany.isPending} />
    </div>
  )
}
```

- [ ] **Step 4: Create Setores admin page**

`src/pages/admin/Setores.jsx`:

```jsx
import { useState } from 'react'
import { useSectors, useCreateSector, useUpdateSector, useDeleteSector } from '@/hooks/useSectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Setores() {
  const [newName, setNewName] = useState('')
  const { data: sectors = [] } = useSectors()
  const createSector = useCreateSector()
  const deleteSector = useDeleteSector()

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createSector.mutateAsync({
        name: newName.trim(),
        display_order: sectors.length + 1,
      })
      setNewName('')
      toast.success('Setor criado!')
    } catch {
      toast.error('Erro ao criar setor.')
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Excluir ${name}?`)) return
    try {
      await deleteSector.mutateAsync(id)
      toast.success('Setor excluído.')
    } catch {
      toast.error('Erro ao excluir. Verifique se não há empresas vinculadas.')
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Setores</h1>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <Input placeholder="Nome do novo setor..." value={newName}
          onChange={(e) => setNewName(e.target.value)} className="max-w-sm" />
        <Button type="submit" disabled={createSector.isPending}>
          <Plus className="mr-2 h-4 w-4" />Adicionar
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.display_order}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id, s.name)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wire into App.jsx**

```jsx
import Empresas from '@/pages/admin/Empresas'
import Setores from '@/pages/admin/Setores'
// ... in admin routes:
<Route path="empresas" element={<Empresas />} />
<Route path="setores" element={<Setores />} />
```

- [ ] **Step 6: Verify CRUD**

Navigate to `/admin/empresas` — create a company with a logo, verify it appears. Navigate to `/admin/setores` — see seeded sectors, add a new one, delete one.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/ src/components/admin/ src/pages/admin/ src/App.jsx
git commit -m "feat: admin CRUD for companies and sectors"
```

---

## Task 10: Banco de Dados (Alumni Directory)

**Files:**
- Create: `src/hooks/useAlumni.js`, `src/components/alumni/AlumniCard.jsx`, `src/components/alumni/AlumniFilters.jsx`, `src/components/common/SearchBar.jsx`, `src/components/common/Pagination.jsx`, `src/pages/BancoDeDados.jsx`

- [ ] **Step 1: Create useAlumni hook**

`src/hooks/useAlumni.js`:

```js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 12

export function useAlumni({ search, sector, company, city, entryClass, openToMentoring, page }) {
  return useQuery({
    queryKey: ['alumni', { search, sector, company, city, entryClass, openToMentoring, page }],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, company:companies(id, name, logo_url, sector:sectors(name))', { count: 'exact' })
        .eq('status', 'approved')
        .order('full_name')

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,job_title.ilike.%${search}%`)
      }
      if (sector) query = query.eq('company.sector_id', sector)
      if (company) query = query.eq('company_id', company)
      if (city) query = query.ilike('city', `%${city}%`)
      if (entryClass) query = query.eq('entry_class', entryClass)
      if (openToMentoring) query = query.eq('open_to_mentoring', true)

      const from = (page - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count, error } = await query
      if (error) throw error

      return { alumni: data || [], total: count || 0, pageSize: PAGE_SIZE }
    },
  })
}
```

- [ ] **Step 2: Create SearchBar component**

`src/components/common/SearchBar.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 300)
    return () => clearTimeout(timer)
  }, [local, onChange])

  useEffect(() => { setLocal(value) }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
```

- [ ] **Step 3: Create Pagination component**

`src/components/common/Pagination.jsx`:

```jsx
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, total, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button variant="outline" size="sm" disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} de {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create AlumniCard component**

`src/components/alumni/AlumniCard.jsx`:

```jsx
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, GraduationCap } from 'lucide-react'

export function AlumniCard({ profile }) {
  const initials = profile.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)

  return (
    <Link to={`/perfil/${profile.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 p-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold">{profile.full_name}</p>
            {profile.job_title && (
              <p className="text-sm text-muted-foreground">{profile.job_title}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {profile.company?.name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />{profile.company.name}
                </span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{profile.city}{profile.state ? `, ${profile.state}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />{profile.entry_class}
              </span>
            </div>
            {profile.open_to_mentoring && (
              <Badge variant="outline" className="mt-2 text-xs">Disponível para mentoria</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 5: Create AlumniFilters component**

`src/components/alumni/AlumniFilters.jsx`:

```jsx
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useSectors } from '@/hooks/useSectors'
import { useCompanies } from '@/hooks/useCompanies'

export function AlumniFilters({ filters, onChange }) {
  const { data: sectors = [] } = useSectors()
  const { data: companies = [] } = useCompanies()

  function update(field, value) {
    onChange({ ...filters, [field]: value, page: 1 })
  }

  function reset() {
    onChange({ search: '', sector: '', company: '', city: '', entryClass: '', openToMentoring: false, page: 1 })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Setor</Label>
        <Select value={filters.sector} onValueChange={(v) => update('sector', v)}>
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Empresa</Label>
        <Select value={filters.company} onValueChange={(v) => update('company', v)}>
          <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Cidade</Label>
        <Input value={filters.city} onChange={(e) => update('city', e.target.value)} placeholder="Ex: Florianópolis" />
      </div>
      <div className="space-y-2">
        <Label>Turma de entrada</Label>
        <Input value={filters.entryClass} onChange={(e) => update('entryClass', e.target.value)} placeholder="Ex: 2017.2" />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={filters.openToMentoring}
          onCheckedChange={(v) => update('openToMentoring', v)} />
        <Label>Apenas mentores</Label>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={reset}>Limpar filtros</Button>
    </div>
  )
}
```

- [ ] **Step 6: Create BancoDeDados page**

`src/pages/BancoDeDados.jsx`:

```jsx
import { useState, useCallback } from 'react'
import { useAlumni } from '@/hooks/useAlumni'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { AlumniCard } from '@/components/alumni/AlumniCard'
import { AlumniFilters } from '@/components/alumni/AlumniFilters'

export default function BancoDeDados() {
  const [filters, setFilters] = useState({
    search: '', sector: '', company: '', city: '', entryClass: '',
    openToMentoring: false, page: 1,
  })

  const { data, isLoading } = useAlumni(filters)

  const handleSearch = useCallback((search) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Banco de Dados</h1>

      <div className="mb-6">
        <SearchBar value={filters.search} onChange={handleSearch}
          placeholder="Buscar por nome ou cargo..." />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <AlumniFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : data?.alumni.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum alumni encontrado.</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {data.total} alumni encontrado{data.total !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.alumni.map((p) => <AlumniCard key={p.id} profile={p} />)}
              </div>
              <Pagination page={filters.page} total={data.total} pageSize={data.pageSize}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Wire into App.jsx**

```jsx
import BancoDeDados from '@/pages/BancoDeDados'
// ... in routes:
<Route path="/banco-de-dados" element={
  <ApprovedRoute><BancoDeDados /></ApprovedRoute>
} />
```

- [ ] **Step 8: Verify directory**

Create a few test users via Supabase Studio (set status='approved', fill in company_id, city, etc.). Navigate to `/banco-de-dados`. Should show search, filters, alumni cards. Filter by sector, city. Pagination works.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/useAlumni.js src/components/alumni/ src/components/common/ src/pages/BancoDeDados.jsx src/App.jsx
git commit -m "feat: alumni directory with search, filters, pagination"
```

---

## Task 11: Profile View Page

**Files:**
- Create: `src/pages/PerfilView.jsx`

- [ ] **Step 1: Create PerfilView page**

`src/pages/PerfilView.jsx`:

```jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Building2, GraduationCap, Linkedin, Mail, ArrowLeft } from 'lucide-react'

export default function PerfilView() {
  const { id } = useParams()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, company:companies(name, logo_url, sector:sectors(name))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <div className="p-8 text-center">Carregando...</div>
  if (!profile) return <div className="p-8 text-center">Perfil não encontrado.</div>

  const initials = profile.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/banco-de-dados">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              {profile.job_title && <p className="text-muted-foreground">{profile.job_title}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {profile.company?.name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />{profile.company.name}
                    {profile.company.sector?.name && ` · ${profile.company.sector.name}`}
                  </span>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city}{profile.state ? `, ${profile.state}` : ''}{profile.country !== 'Brasil' ? `, ${profile.country}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Turma {profile.entry_class}
                  {profile.graduation_class ? ` → ${profile.graduation_class}` : ' (cursando)'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.bio && (
            <div>
              <h3 className="mb-1 font-semibold">Sobre</h3>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {profile.skills?.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Habilidades</h3>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </div>
          )}

          {profile.interests?.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Interesses</h3>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map((i) => <Badge key={i} variant="outline">{i}</Badge>)}
              </div>
            </div>
          )}

          {profile.career_history?.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Experiência</h3>
              <div className="space-y-2">
                {profile.career_history.map((entry, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{entry.title} — {entry.company_name}</p>
                    <p className="text-muted-foreground">
                      {entry.start_year}{entry.end_year ? ` – ${entry.end_year}` : ' – Atual'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {profile.open_to_mentoring && <Badge>Disponível para mentoria</Badge>}
            {profile.open_to_contact && <Badge variant="outline">Aberto a contato</Badge>}
          </div>

          <div className="flex gap-3">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Linkedin className="mr-2 h-4 w-4" />LinkedIn
                </Button>
              </a>
            )}
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`}>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />Email
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Wire into App.jsx**

```jsx
import PerfilView from '@/pages/PerfilView'
// ... in routes:
<Route path="/perfil/:id" element={
  <ApprovedRoute><PerfilView /></ApprovedRoute>
} />
```

- [ ] **Step 3: Verify**

Click an alumni card in Banco de Dados — should navigate to their full profile page with all details. Back button returns to directory.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PerfilView.jsx src/App.jsx
git commit -m "feat: alumni profile view page"
```

---

## Task 12: Mapa dos Egressos

**Files:**
- Create: `src/hooks/useMapaStats.js`, `src/components/mapa/StatCard.jsx`, `src/components/mapa/MapaCharts.jsx`, `src/components/mapa/LogoCluster.jsx`, `src/pages/MapaDosEgressos.jsx`

- [ ] **Step 1: Create useMapaStats hook**

`src/hooks/useMapaStats.js`:

```js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMapaStats() {
  return useQuery({
    queryKey: ['mapa-stats'],
    queryFn: async () => {
      const [profilesRes, companiesRes, sectorsRes] = await Promise.all([
        supabase.from('profiles').select('id, entry_class, city, state, company_id').eq('status', 'approved'),
        supabase.from('companies').select('id, name, logo_url, sector_id, sector:sectors(id, name)').eq('status', 'approved'),
        supabase.from('sectors').select('*').order('display_order'),
      ])

      const profiles = profilesRes.data || []
      const companies = companiesRes.data || []
      const sectors = sectorsRes.data || []

      // Count alumni per company
      const alumniPerCompany = {}
      profiles.forEach((p) => {
        if (p.company_id) {
          alumniPerCompany[p.company_id] = (alumniPerCompany[p.company_id] || 0) + 1
        }
      })

      // Count alumni per sector
      const alumniPerSector = {}
      companies.forEach((c) => {
        if (c.sector?.name && alumniPerCompany[c.id]) {
          alumniPerSector[c.sector.name] = (alumniPerSector[c.sector.name] || 0) + alumniPerCompany[c.id]
        }
      })

      // Count alumni per entry_class
      const alumniPerClass = {}
      profiles.forEach((p) => {
        if (p.entry_class) {
          alumniPerClass[p.entry_class] = (alumniPerClass[p.entry_class] || 0) + 1
        }
      })

      // Count alumni per state
      const alumniPerState = {}
      profiles.forEach((p) => {
        const location = p.state || p.city || 'Não informado'
        alumniPerState[location] = (alumniPerState[location] || 0) + 1
      })

      // Build logo cluster data grouped by sector
      const logoCluster = sectors
        .map((s) => ({
          sector: s.name,
          companies: companies
            .filter((c) => c.sector_id === s.id && alumniPerCompany[c.id])
            .map((c) => ({
              id: c.id,
              name: c.name,
              logo_url: c.logo_url,
              alumni_count: alumniPerCompany[c.id] || 0,
            }))
            .sort((a, b) => b.alumni_count - a.alumni_count),
        }))
        .filter((g) => g.companies.length > 0)

      return {
        totalAlumni: profiles.length,
        totalCompanies: companies.length,
        totalSectors: sectors.length,
        totalClasses: new Set(profiles.map((p) => p.entry_class)).size,
        alumniPerSector: Object.entries(alumniPerSector)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        alumniPerClass: Object.entries(alumniPerClass)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        alumniPerState: Object.entries(alumniPerState)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        logoCluster,
      }
    },
  })
}
```

- [ ] **Step 2: Create StatCard component**

`src/components/mapa/StatCard.jsx`:

```jsx
import { Card, CardContent } from '@/components/ui/card'

export function StatCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {Icon && <Icon className="h-8 w-8 text-primary" />}
        <div>
          <p className="text-3xl font-bold">{value ?? '...'}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create MapaCharts component**

`src/components/mapa/MapaCharts.jsx`:

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#0f766e', '#115e59', '#134e4a', '#0891b2', '#06b6d4']

export function MapaCharts({ alumniPerSector, alumniPerClass, alumniPerState }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Alumni por Setor */}
      <Card>
        <CardHeader><CardTitle className="text-base">Alumni por Setor</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={alumniPerSector} dataKey="count" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {alumniPerSector.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alumni por Turma */}
      <Card>
        <CardHeader><CardTitle className="text-base">Alumni por Turma</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alumniPerClass}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alumni por Estado */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Alumni por Localização (Top 10)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alumniPerState} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Create LogoCluster component**

`src/components/mapa/LogoCluster.jsx`:

```jsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function logoSize(count) {
  if (count >= 5) return 'h-16 w-16'
  if (count >= 2) return 'h-12 w-12'
  return 'h-10 w-10'
}

export function LogoCluster({ data, onCompanyClick }) {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {data.map((group) => (
          <div key={group.sector}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              {group.sector}
            </h3>
            <div className="flex flex-wrap gap-3">
              {group.companies.map((company) => (
                <Tooltip key={company.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onCompanyClick?.(company)}
                      className="transition-transform hover:scale-110"
                    >
                      <Avatar className={`${logoSize(company.alumni_count)} rounded-md border bg-white p-1`}>
                        <AvatarImage src={company.logo_url} className="object-contain" />
                        <AvatarFallback className="rounded-md text-xs">
                          {company.name.slice(0, 3)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs">{company.alumni_count} alumni</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
```

Add shadcn tooltip:

```bash
npx shadcn@latest add tooltip
```

- [ ] **Step 5: Create MapaDosEgressos page**

`src/pages/MapaDosEgressos.jsx`:

```jsx
import { useMapaStats } from '@/hooks/useMapaStats'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/mapa/StatCard'
import { MapaCharts } from '@/components/mapa/MapaCharts'
import { LogoCluster } from '@/components/mapa/LogoCluster'
import { Users, Building2, Layers, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MapaDosEgressos() {
  const { data, isLoading } = useMapaStats()
  const { isApproved } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return <div className="p-8 text-center">Carregando...</div>
  if (!data) return null

  function handleCompanyClick(company) {
    if (isApproved) {
      navigate(`/banco-de-dados?company=${company.id}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Mapa dos Egressos</h1>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Egressos" value={data.totalAlumni} icon={Users} />
        <StatCard label="Empresas" value={data.totalCompanies} icon={Building2} />
        <StatCard label="Setores" value={data.totalSectors} icon={Layers} />
        <StatCard label="Turmas" value={data.totalClasses} icon={GraduationCap} />
      </div>

      {/* Charts */}
      <div className="mb-8">
        <MapaCharts
          alumniPerSector={data.alumniPerSector}
          alumniPerClass={data.alumniPerClass}
          alumniPerState={data.alumniPerState}
        />
      </div>

      {/* Logo cluster — only for approved users */}
      {isApproved ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Empresas por Setor</h2>
          <LogoCluster data={data.logoCluster} onCompanyClick={handleCompanyClick} />
        </div>
      ) : (
        <div className="rounded-md border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">
            Faça login e tenha sua conta aprovada para ver o mapa completo com as empresas.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Wire into App.jsx**

```jsx
import MapaDosEgressos from '@/pages/MapaDosEgressos'
// ... in routes (public, no guard):
<Route path="/mapa-dos-egressos" element={<MapaDosEgressos />} />
```

- [ ] **Step 7: Verify**

Navigate to `/mapa-dos-egressos`. Should show stat cards, charts (if there's data), and logo cluster (if approved). Anonymous users see stats+charts only, with a prompt to log in for the full map.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useMapaStats.js src/components/mapa/ src/pages/MapaDosEgressos.jsx src/App.jsx
git commit -m "feat: Mapa dos Egressos — stats, charts, logo cluster grid"
```

---

## Task 13: Landing Page

**Files:**
- Create: `src/pages/Landing.jsx`

- [ ] **Step 1: Create Landing page**

`src/pages/Landing.jsx`:

```jsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Building2, MapPin, ArrowRight } from 'lucide-react'

export default function Landing() {
  const { data: stats } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const [alumni, companies, sectors] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('companies').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('sectors').select('id', { count: 'exact', head: true }),
      ])
      return {
        alumni: alumni.count || 0,
        companies: companies.count || 0,
        sectors: sectors.count || 0,
      }
    },
  })

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Alumni <span className="text-primary">Automação UFSC</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          Conectando egressos do curso de Engenharia de Controle e Automação da UFSC.
          Descubra onde nossos alumni estão, o que estão fazendo e conecte-se com eles.
        </p>
        <div className="flex gap-3">
          <Link to="/cadastro"><Button size="lg">Cadastre-se</Button></Link>
          <Link to="/mapa-dos-egressos"><Button size="lg" variant="outline">Ver Mapa</Button></Link>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-y bg-muted/40 py-12">
          <div className="container mx-auto grid gap-6 px-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.alumni}</p>
              <p className="text-muted-foreground">Alumni cadastrados</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.companies}</p>
              <p className="text-muted-foreground">Empresas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.sectors}</p>
              <p className="text-muted-foreground">Setores</p>
            </div>
          </div>
        </section>
      )}

      {/* Feature cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link to="/banco-de-dados">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <Users className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Banco de Dados</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre alumni por empresa, setor, turma ou cidade.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-primary">
                  Explorar <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/mapa-dos-egressos">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <MapPin className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Mapa dos Egressos</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize onde nossos alumni estão trabalhando por setor e região.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-primary">
                  Ver mapa <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/contato">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <Building2 className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Contato</h3>
                <p className="text-sm text-muted-foreground">
                  Entre em contato com a diretoria do Alumni Automação.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-primary">
                  Fale conosco <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Wire into App.jsx**

```jsx
import Landing from '@/pages/Landing'
// ... in routes:
<Route path="/" element={<Landing />} />
```

- [ ] **Step 3: Verify**

Navigate to `/`. Should show hero, stats, and feature cards. Links work.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Landing.jsx src/App.jsx
git commit -m "feat: landing page with hero, stats, feature cards"
```

---

## Task 14: Contact Page + Admin Inbox

**Files:**
- Create: `src/hooks/useContactMessages.js`, `src/pages/Contato.jsx`, `src/pages/admin/ContatoAdmin.jsx`

- [ ] **Step 1: Create useContactMessages hook**

`src/hooks/useContactMessages.js`:

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useContactMessages() {
  return useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSendContactMessage() {
  return useMutation({
    mutationFn: async ({ name, email, message }) => {
      const { error } = await supabase
        .from('contact_messages')
        .insert({ name, email, message })
      if (error) throw error
    },
  })
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, read }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}
```

- [ ] **Step 2: Create Contato page (public form)**

`src/pages/Contato.jsx`:

```jsx
import { useState } from 'react'
import { useSendContactMessage } from '@/hooks/useContactMessages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function Contato() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const sendMessage = useSendContactMessage()

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await sendMessage.mutateAsync(form)
      setSent(true)
    } catch {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    }
  }

  if (sent) {
    return (
      <div className="container mx-auto flex max-w-lg items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Mensagem enviada!</CardTitle>
            <CardDescription>
              Obrigado pelo contato. Responderemos o mais breve possível.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contato</CardTitle>
          <CardDescription>
            Envie uma mensagem para a diretoria do Alumni Automação UFSC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={updateField('name')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={updateField('email')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" value={form.message} onChange={updateField('message')} rows={5} required />
            </div>
            <Button type="submit" className="w-full" disabled={sendMessage.isPending}>
              {sendMessage.isPending ? 'Enviando...' : 'Enviar mensagem'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create ContatoAdmin page**

`src/pages/admin/ContatoAdmin.jsx`:

```jsx
import { useState } from 'react'
import { useContactMessages, useMarkMessageRead } from '@/hooks/useContactMessages'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail, MailOpen } from 'lucide-react'

export default function ContatoAdmin() {
  const { data: messages = [] } = useContactMessages()
  const markRead = useMarkMessageRead()
  const [selected, setSelected] = useState(null)

  function openMessage(msg) {
    setSelected(msg)
    if (!msg.read) {
      markRead.mutate({ id: msg.id, read: true })
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mensagens de Contato</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id} className="cursor-pointer" onClick={() => openMessage(msg)}>
                <TableCell>
                  {msg.read
                    ? <MailOpen className="h-4 w-4 text-muted-foreground" />
                    : <Mail className="h-4 w-4 text-primary" />
                  }
                </TableCell>
                <TableCell className={msg.read ? '' : 'font-semibold'}>{msg.name}</TableCell>
                <TableCell>{msg.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma mensagem.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensagem de {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {selected?.email}</p>
            <p><strong>Data:</strong> {selected && new Date(selected.created_at).toLocaleString('pt-BR')}</p>
            <div className="mt-4 whitespace-pre-wrap rounded-md bg-muted p-4">
              {selected?.message}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 4: Wire into App.jsx**

```jsx
import Contato from '@/pages/Contato'
import ContatoAdmin from '@/pages/admin/ContatoAdmin'
// ... in routes:
<Route path="/contato" element={<Contato />} />
// ... in admin routes:
<Route path="contato" element={<ContatoAdmin />} />
```

- [ ] **Step 5: Verify**

Navigate to `/contato` — submit a message. Navigate to `/admin/contato` — message appears with unread indicator. Click to read — dialog opens, marks as read.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useContactMessages.js src/pages/Contato.jsx src/pages/admin/ContatoAdmin.jsx src/App.jsx
git commit -m "feat: contact form (public) and admin message inbox"
```

---

## Task 15: Final App.jsx Cleanup & Deploy Script

**Files:**
- Modify: `src/App.jsx` (remove all remaining placeholders)
- Create: `deploy.sh`

- [ ] **Step 1: Ensure all page imports are in App.jsx, remove Placeholder**

Verify `App.jsx` imports all real pages and no `Placeholder` references remain. All routes should point to actual components.

- [ ] **Step 2: Create deploy script**

`deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Downloading latest build artifact from GitHub Actions..."
gh run download --name dist -D ./dist

echo "Uploading to UFSC server via FTP..."
echo "Make sure you are connected to the UFSC VPN!"
lftp -c "open ftp://\$FTP_USER:\$FTP_PASS@alumni.automacao.ufsc.br; mirror -R --delete ./dist /"

echo "Deploy complete!"
```

- [ ] **Step 3: Final verification**

```bash
npm run build
```

Expected: Build succeeds with no errors. Check `dist/` for `index.html`, assets, and `.htaccess`.

```bash
npm run dev
```

Walk through all routes manually: landing, login, register, profile, directory, mapa, contact, admin (all sub-pages). Verify mobile responsive layout.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx deploy.sh
git commit -m "feat: final cleanup, deploy script — Phase 1 MVP complete"
```

- [ ] **Step 5: Push**

```bash
git push origin main
```
