create table public.palestras (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_url text not null,
  category text not null default 'alumni_talk',
  alumni_id uuid references public.alumni(id),
  event_name text,
  event_date date,
  published boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.palestras enable row level security;

create policy "palestras_read" on public.palestras for select using (published = true or public.is_admin());
create policy "palestras_insert" on public.palestras for insert with check (public.is_admin());
create policy "palestras_update" on public.palestras for update using (public.is_admin());
create policy "palestras_delete" on public.palestras for delete using (public.is_admin());
