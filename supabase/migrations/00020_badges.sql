-- Badge definitions
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text not null default 'award',
  color text not null default '#0d9488',
  created_at timestamptz not null default now()
);

-- Badge awards (many-to-many: alumni <-> badges)
create table public.alumni_badges (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid not null references public.alumni(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_by uuid references public.profiles(id),
  unique(alumni_id, badge_id)
);

alter table public.badges enable row level security;
alter table public.alumni_badges enable row level security;

-- RLS
create policy "badges_read" on public.badges for select using (true);
create policy "badges_write" on public.badges for all using (public.is_admin());

create policy "alumni_badges_read" on public.alumni_badges for select using (true);
create policy "alumni_badges_write" on public.alumni_badges for all using (public.is_admin());

-- Seed default badges
insert into public.badges (slug, name, description, icon, color) values
  ('entrevistado', 'Entrevistado', 'Participou de uma entrevista escrita no site', 'file-text', '#3b82f6'),
  ('trabalho-alumni', 'Trabalho Alumni', 'Participou do Trabalho Alumni — entrevista por calouros', 'video', '#ec4899'),
  ('alumni-talk', 'Alumni Talk', 'Participou como palestrante no Alumni Talks', 'mic', '#8b5cf6'),
  ('mentor', 'Mentor', 'Disponível para mentoria de alunos e egressos', 'heart-handshake', '#10b981'),
  ('contratando', 'Contratando', 'Está contratando para sua equipe', 'briefcase', '#22c55e');
