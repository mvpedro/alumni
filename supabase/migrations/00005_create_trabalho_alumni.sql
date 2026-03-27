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
