# Alumni Automação UFSC — Phase 2: Content, SEO & Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add blog (Entrevistas) with SEO, Trabalho Alumni YouTube videos, user-submitted company logos, company sector bulk-assignment, Alumni logo branding, and professional UI polish across the app.

**Architecture:** Extends the existing React SPA + Supabase stack. Blog posts stored in `interviews` table (already exists), rendered from markdown. Trabalho Alumni videos stored in `trabalho_alumni` table (already exists). User-submitted logos extend the existing `companies` table's `status`/`submitted_by` fields. SEO pre-rendering deferred to a later slice (vite-ssg) — for now, blog pages use react-helmet-async for meta tags.

**Tech Stack:** Existing stack + react-markdown, react-helmet-async, lucide-react icons

**Spec:** `docs/superpowers/specs/2026-03-26-alumni-platform-design.md` — Phase 2 section

---

## File Structure

### New files

```
src/
├── hooks/
│   ├── useInterviews.js           — CRUD hooks for interviews table
│   └── useTrabalhoAlumni.js       — CRUD hooks for trabalho_alumni table
├── components/
│   ├── blog/
│   │   ├── PostCard.jsx            — card for blog listing (cover, title, excerpt, date)
│   │   └── PostContent.jsx         — markdown renderer for blog post
│   ├── common/
│   │   └── YouTubeEmbed.jsx        — responsive YouTube iframe wrapper
│   └── admin/
│       ├── InterviewForm.jsx       — create/edit blog post (title, slug, markdown, cover upload)
│       └── TrabalhoAlumniForm.jsx  — create/edit video (title, desc, youtube URL)
├── pages/
│   ├── Entrevistas.jsx             — public blog listing
│   ├── EntrevistaPost.jsx          — single blog post page
│   ├── TrabalhoAlumni.jsx          — public YouTube videos grid
│   └── admin/
│       ├── EntrevistasAdmin.jsx    — admin CRUD for blog posts
│       └── TrabalhoAlumniAdmin.jsx — admin CRUD for videos
```

### Modified files

```
src/App.jsx                          — add new routes
src/components/layout/Navbar.jsx     — add Entrevistas + Trabalho Alumni nav links, use logo image
src/components/layout/AdminLayout.jsx — add Entrevistas + Trabalho Alumni admin nav items
src/components/layout/Footer.jsx     — professional footer with links
src/pages/Landing.jsx                — use logo, improve hero
src/pages/admin/Empresas.jsx         — add pending logos tab, bulk sector assign
src/hooks/useCompanies.js            — add approve/reject mutations for user-submitted logos
src/components/admin/CompanyForm.jsx — add submitted_by field for user submissions
src/pages/Perfil.jsx                 — company suggestion flow (submit new company)
src/index.css                        — polish: consistent spacing, professional typography
```

### New migrations

```
supabase/migrations/
├── 00012_alumni_insert_policy.sql   — allow authenticated users to insert companies with status='pending'
```

---

## Task 1: Blog Hooks & Admin CRUD

**Files:**
- Create: `src/hooks/useInterviews.js`, `src/components/admin/InterviewForm.jsx`, `src/pages/admin/EntrevistasAdmin.jsx`
- Modify: `src/components/layout/AdminLayout.jsx`, `src/App.jsx`

- [ ] **Step 1: Create useInterviews hook**

`src/hooks/useInterviews.js`:
```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useInterviews({ published } = {}) {
  return useQuery({
    queryKey: ['interviews', { published }],
    queryFn: async () => {
      let query = supabase
        .from('interviews')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
      if (published !== undefined) query = query.eq('published', published)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useInterview(slug) {
  return useQuery({
    queryKey: ['interview', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function useCreateInterview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ title, content, excerpt, coverFile, published }) => {
      const slug = slugify(title)
      const userId = (await supabase.auth.getUser()).data.user.id

      let cover_image_url = null
      if (coverFile) {
        const path = `${slug}.${coverFile.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage
          .from('blog-covers')
          .upload(path, coverFile, { upsert: true })
        if (upErr) throw upErr
        cover_image_url = supabase.storage.from('blog-covers').getPublicUrl(path).data.publicUrl
      }

      const { data, error } = await supabase
        .from('interviews')
        .insert({
          title,
          slug,
          content,
          excerpt,
          cover_image_url,
          author_id: userId,
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  })
}

export function useUpdateInterview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, coverFile, ...fields }) => {
      let cover_image_url = fields.cover_image_url
      if (coverFile) {
        const slug = fields.slug || fields.title?.toLowerCase().replace(/\s+/g, '-') || id
        const path = `${slug}.${coverFile.name.split('.').pop()}`
        await supabase.storage.from('blog-covers').upload(path, coverFile, { upsert: true })
        cover_image_url = supabase.storage.from('blog-covers').getPublicUrl(path).data.publicUrl
      }

      if (fields.published && !fields.published_at) {
        fields.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('interviews')
        .update({ ...fields, cover_image_url })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  })
}

export function useDeleteInterview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('interviews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  })
}
```

- [ ] **Step 2: Install react-markdown + react-helmet-async**

```bash
npm install react-markdown react-helmet-async
```

- [ ] **Step 3: Create InterviewForm dialog**

`src/components/admin/InterviewForm.jsx`:

A Dialog with fields: title (Input), slug (auto-generated, editable), excerpt (Textarea, 2 rows), content (Textarea, 15 rows, markdown), cover image (file Input), published (Switch). Props: `open`, `onOpenChange`, `onSubmit`, `loading`, `initial`.

The slug auto-generates from title on change (only if creating, not editing). Content field has a label "Conteúdo (Markdown)".

- [ ] **Step 4: Create EntrevistasAdmin page**

`src/pages/admin/EntrevistasAdmin.jsx`:

Table with columns: title, status (published badge vs draft badge), published date, actions (edit, delete). "Novo post" button opens InterviewForm. Click row to edit. Uses `useInterviews()` (no published filter — admins see all).

- [ ] **Step 5: Add admin nav item + route**

In `src/components/layout/AdminLayout.jsx`, add `{ to: '/admin/entrevistas', label: 'Entrevistas', icon: FileText }` to navItems (import `FileText` from lucide-react).

In `src/App.jsx`, add:
```jsx
import EntrevistasAdmin from '@/pages/admin/EntrevistasAdmin'
// ... in admin routes:
<Route path="entrevistas" element={<EntrevistasAdmin />} />
```

- [ ] **Step 6: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: blog admin CRUD — create, edit, delete interview posts"
```

---

## Task 2: Public Blog Pages

**Files:**
- Create: `src/components/blog/PostCard.jsx`, `src/components/blog/PostContent.jsx`, `src/pages/Entrevistas.jsx`, `src/pages/EntrevistaPost.jsx`
- Modify: `src/App.jsx`, `src/components/layout/Navbar.jsx`

- [ ] **Step 1: Create PostCard component**

`src/components/blog/PostCard.jsx`:

Link card showing: cover image (or gradient placeholder), title, excerpt (2-line clamp), published date formatted in pt-BR. Links to `/entrevistas/:slug`.

- [ ] **Step 2: Create PostContent component**

`src/components/blog/PostContent.jsx`:

Uses `react-markdown` to render markdown content with Tailwind prose styling. Wraps content in `<article className="prose prose-neutral max-w-none">`.

- [ ] **Step 3: Create Entrevistas listing page**

`src/pages/Entrevistas.jsx`:

h1 "Entrevistas", subtitle text, grid of PostCards (responsive: 1 col mobile, 2 cols md, 3 cols lg). Uses `useInterviews({ published: true })`. Shows "Nenhuma entrevista publicada ainda." empty state.

- [ ] **Step 4: Create EntrevistaPost page**

`src/pages/EntrevistaPost.jsx`:

Uses `useInterview(slug)` with slug from `useParams()`. Shows: cover image (full width), title (h1), author info (if available), published date, PostContent with markdown. Back link to `/entrevistas`. Uses `react-helmet-async` for SEO meta tags:

```jsx
import { Helmet } from 'react-helmet-async'
// ...
<Helmet>
  <title>{post.title} | Alumni Automação UFSC</title>
  <meta name="description" content={post.excerpt} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.excerpt} />
  {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
  <meta property="og:type" content="article" />
</Helmet>
```

- [ ] **Step 5: Wire HelmetProvider, routes, and nav**

In `src/main.jsx`, wrap App with `<HelmetProvider>`:
```jsx
import { HelmetProvider } from 'react-helmet-async'
// ...
<HelmetProvider><App /></HelmetProvider>
```

In `src/App.jsx`, add routes:
```jsx
import Entrevistas from '@/pages/Entrevistas'
import EntrevistaPost from '@/pages/EntrevistaPost'
// ... in MainLayout routes (public):
<Route path="/entrevistas" element={<Entrevistas />} />
<Route path="/entrevistas/:slug" element={<EntrevistaPost />} />
```

In `src/components/layout/Navbar.jsx`, add `{ to: '/entrevistas', label: 'Entrevistas' }` to publicLinks.

- [ ] **Step 6: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: public blog pages — listing, post view, SEO meta tags"
```

---

## Task 3: Trabalho Alumni (YouTube Videos)

**Files:**
- Create: `src/hooks/useTrabalhoAlumni.js`, `src/components/common/YouTubeEmbed.jsx`, `src/components/admin/TrabalhoAlumniForm.jsx`, `src/pages/TrabalhoAlumni.jsx`, `src/pages/admin/TrabalhoAlumniAdmin.jsx`
- Modify: `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/components/layout/AdminLayout.jsx`

- [ ] **Step 1: Create useTrabalhoAlumni hook**

`src/hooks/useTrabalhoAlumni.js`:

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useTrabalhoAlumni({ published } = {}) {
  return useQuery({
    queryKey: ['trabalho-alumni', { published }],
    queryFn: async () => {
      let query = supabase
        .from('trabalho_alumni')
        .select('*')
        .order('display_order')
      if (published !== undefined) query = query.eq('published', published)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fields) => {
      const { data, error } = await supabase
        .from('trabalho_alumni')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trabalho-alumni'] }),
  })
}

export function useUpdateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { error } = await supabase.from('trabalho_alumni').update(fields).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trabalho-alumni'] }),
  })
}

export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('trabalho_alumni').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trabalho-alumni'] }),
  })
}
```

- [ ] **Step 2: Create YouTubeEmbed component**

`src/components/common/YouTubeEmbed.jsx`:

Extract YouTube video ID from URL (handle youtube.com/watch?v=, youtu.be/, youtube.com/embed/ formats). Render responsive 16:9 iframe. Props: `url`, `title`.

```jsx
function getYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] ?? null
}

export function YouTubeEmbed({ url, title }) {
  const videoId = getYouTubeId(url)
  if (!videoId) return null

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
```

- [ ] **Step 3: Create TrabalhoAlumniForm dialog**

`src/components/admin/TrabalhoAlumniForm.jsx`:

Dialog with: title (Input), description (Textarea), youtube_url (Input, required), display_order (Input number), published (Switch). Props: `open`, `onOpenChange`, `onSubmit`, `loading`, `initial`.

- [ ] **Step 4: Create TrabalhoAlumniAdmin page**

`src/pages/admin/TrabalhoAlumniAdmin.jsx`:

Table: title, YouTube URL (truncated), order, published toggle, actions (edit, delete). "Novo vídeo" button. Uses `useTrabalhoAlumni()` (no filter — admins see all).

- [ ] **Step 5: Create public TrabalhoAlumni page**

`src/pages/TrabalhoAlumni.jsx`:

h1 "Trabalho Alumni", subtitle explaining the section, responsive grid (1 col mobile, 2 cols lg) of cards. Each card: YouTubeEmbed + title + description below. Uses `useTrabalhoAlumni({ published: true })`.

- [ ] **Step 6: Wire routes, nav, admin nav**

`src/App.jsx`: add routes for `/trabalho-alumni` (public) and `/admin/trabalho-alumni`.
`src/components/layout/Navbar.jsx`: add `{ to: '/trabalho-alumni', label: 'Trabalho Alumni' }` to publicLinks.
`src/components/layout/AdminLayout.jsx`: add `{ to: '/admin/trabalho-alumni', label: 'Trabalho Alumni', icon: Video }` (import `Video` from lucide-react).

- [ ] **Step 7: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: Trabalho Alumni — YouTube video management and public grid"
```

---

## Task 4: User-Submitted Company Logos

**Files:**
- Create: `supabase/migrations/00012_alumni_insert_company_policy.sql`
- Modify: `src/hooks/useCompanies.js`, `src/pages/admin/Empresas.jsx`, `src/pages/Perfil.jsx`

- [ ] **Step 1: Add RLS policy for authenticated company insert**

`supabase/migrations/00012_alumni_insert_company_policy.sql`:
```sql
-- Allow authenticated users to insert companies with status='pending'
create policy "companies_insert_authenticated" on public.companies
  for insert with check (
    auth.uid() is not null and status = 'pending'
  );
```

Push migration:
```bash
export SUPABASE_ACCESS_TOKEN="..." && npx supabase db push
```

- [ ] **Step 2: Add company suggestion hook**

Add to `src/hooks/useCompanies.js`:
```js
export function useSuggestCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, sector_id, website, logoFile }) => {
      const userId = (await supabase.auth.getUser()).data.user.id
      const { data, error } = await supabase
        .from('companies')
        .insert({ name, sector_id, website, status: 'pending', submitted_by: userId })
        .select()
        .single()
      if (error) throw error

      if (logoFile) {
        const path = `${data.id}.${logoFile.name.split('.').pop()}`
        await supabase.storage.from('company-logos').upload(path, logoFile)
        const publicUrl = supabase.storage.from('company-logos').getPublicUrl(path).data.publicUrl
        await supabase.from('companies').update({ logo_url: publicUrl }).eq('id', data.id)
      }
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useApproveCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('companies')
        .update({ status: 'approved' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function usePendingCompanies() {
  return useQuery({
    queryKey: ['companies', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*, sector:sectors(id, name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
```

- [ ] **Step 3: Add pending tab to Empresas admin**

Modify `src/pages/admin/Empresas.jsx`: Add a Tabs component at the top with "Aprovadas" and "Pendentes ({count})" tabs. The "Pendentes" tab shows a separate table using `usePendingCompanies()` with Approve/Reject buttons per row. Import `Tabs, TabsContent, TabsList, TabsTrigger` from shadcn.

- [ ] **Step 4: Add company suggestion to Profile page**

Modify `src/pages/Perfil.jsx`: If the user's company isn't in the dropdown, show a "Sugerir nova empresa" link below the company Select that opens a small Dialog with name, sector, website, logo. Uses `useSuggestCompany()`. Show toast: "Empresa sugerida! Um administrador irá revisar."

- [ ] **Step 5: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: user-submitted company logos with admin approval flow"
```

---

## Task 5: Company Sector Bulk-Assignment

**Files:**
- Modify: `src/pages/admin/Empresas.jsx`

- [ ] **Step 1: Add bulk sector assignment UI**

Add a "Atribuir setor em massa" section to the Empresas admin page, visible on the "Aprovadas" tab. Shows a filter for "Sem setor" (companies where sector is "Não classificado"). For each company, show an inline Select dropdown to pick a sector. On change, immediately update via `useUpdateCompany`.

Add a count badge: "X empresas sem setor".

- [ ] **Step 2: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: bulk sector assignment for companies in admin panel"
```

---

## Task 6: Alumni Logo & Branding

**Files:**
- Modify: `src/components/layout/Navbar.jsx`, `src/pages/Landing.jsx`, `src/pages/Login.jsx`, `src/pages/Cadastro.jsx`

NOTE: The logo file should be in `public/` (e.g. `public/alumni-logo.png`). If it's not there yet, use a text placeholder that's easy to swap.

- [ ] **Step 1: Add logo to Navbar**

In `src/components/layout/Navbar.jsx`, replace the text "Alumni Automação" with:
```jsx
<Link to="/" className="flex items-center gap-2 font-bold text-primary">
  <img src="/alumni-logo.png" alt="Alumni Automação" className="h-8 w-auto" />
  <span className="hidden sm:inline">Alumni Automação</span>
</Link>
```

If logo file doesn't exist, use a fallback text-only approach that won't break.

- [ ] **Step 2: Add logo to Landing hero**

In `src/pages/Landing.jsx`, add the logo image above the h1 in the hero section:
```jsx
<img src="/alumni-logo.png" alt="" className="mx-auto mb-6 h-24 w-auto" />
```

- [ ] **Step 3: Add logo to Login/Cadastro**

In both `src/pages/Login.jsx` and `src/pages/Cadastro.jsx`, add the logo above the Card:
```jsx
<img src="/alumni-logo.png" alt="Alumni Automação UFSC" className="mx-auto mb-6 h-16 w-auto" />
```

- [ ] **Step 4: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: add Alumni logo to navbar, landing, login, registration"
```

---

## Task 7: UI Polish & Professional Look

**Files:**
- Modify: `src/index.css`, `src/components/layout/Footer.jsx`, `src/pages/Landing.jsx`, `src/pages/BancoDeDados.jsx`, `src/pages/MapaDosEgressos.jsx`, `src/pages/Contato.jsx`, `src/pages/Perfil.jsx`, `src/pages/PerfilView.jsx`, various admin pages

This is the "make it look less vibecoded" task. Focus areas:

- [ ] **Step 1: Improve global typography and spacing**

Update `src/index.css`: ensure consistent base font size, line height, and heading hierarchy. Add smooth scroll behavior. Ensure the teal primary color looks professional (not too saturated).

- [ ] **Step 2: Professional Footer**

Replace `src/components/layout/Footer.jsx` with a proper footer: 3-column layout (About section with Alumni description, Quick Links column, Contact/Social column). Copyright at bottom. Responsive — stacks on mobile.

- [ ] **Step 3: Improve Landing page**

Update `src/pages/Landing.jsx`:
- Better hero spacing and typography (larger heading, better subtitle, more breathing room)
- Stats section: add subtle animations or better visual treatment (icons, better cards)
- Feature cards: improve hover states, consistent card heights
- Add a "Depoimentos" or "Últimas Entrevistas" section if blog posts exist

- [ ] **Step 4: Improve card and table designs**

Across all pages:
- AlumniCard: add subtle hover elevation, better avatar sizing
- Admin tables: better spacing, consistent action button placement
- Form layouts: proper field grouping, section dividers
- Loading skeletons everywhere (replace "Carregando..." text with animated skeletons)

- [ ] **Step 5: Error and empty states**

Create a reusable `EmptyState` component (`src/components/common/EmptyState.jsx`) with icon, title, description, optional action button. Use it consistently across all listing pages.

Add an error boundary wrapper for graceful error handling.

- [ ] **Step 6: Mobile refinements**

Test all pages at 375px width:
- Navbar hamburger menu: ensure all links work
- Admin sidebar: add mobile dropdown/sheet for admin nav
- Tables: horizontal scroll on mobile
- Cards: single column, proper padding
- Forms: full width inputs, proper spacing

- [ ] **Step 7: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: UI polish — professional typography, footer, loading states, mobile refinements"
```

---

## Summary

| Task | Delivers | Depends on |
|---|---|---|
| 1. Blog Admin CRUD | Admin can create/edit/delete interview posts | — |
| 2. Public Blog Pages | Blog listing + post view with SEO meta tags | Task 1 |
| 3. Trabalho Alumni | YouTube video management + public grid | — |
| 4. User-Submitted Logos | Users suggest companies, admin approves | — |
| 5. Sector Bulk-Assignment | Admins bulk-assign sectors to companies | — |
| 6. Logo & Branding | Alumni logo in navbar, landing, auth pages | — |
| 7. UI Polish | Professional look, loading states, mobile | Tasks 1-6 |

Tasks 1, 3, 4, 5, 6 are independent and can be parallelized. Task 2 depends on Task 1. Task 7 should be last.
