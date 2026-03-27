-- Alumni table: the directory source of truth
-- Contains both imported records and registered users' data
create table public.alumni (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  entry_class text,
  graduation_class text,
  contact_email text,
  linkedin_url text,
  gender text check (gender in ('M', 'F', null)),
  currently_employed boolean,
  company_id uuid references public.companies(id),
  job_title text,
  city text,
  state text,
  country text not null default 'Brasil',
  bio text,
  avatar_url text,
  skills text[],
  interests text[],
  career_history jsonb,
  extracurriculars text[],
  has_international_experience boolean not null default false,
  international_experience_type text,
  international_experience_detail text,
  open_to_mentoring boolean not null default false,
  open_to_contact boolean not null default false,
  profile_id uuid unique references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger on_alumni_updated
  before update on public.alumni
  for each row execute function public.handle_updated_at();

alter table public.alumni enable row level security;

-- RLS: everyone can read alumni, only linked profile owner or admin can write
create policy "alumni_read" on public.alumni for select using (true);
create policy "alumni_update_own" on public.alumni for update using (
  profile_id = auth.uid() or public.is_admin()
);
create policy "alumni_insert_admin" on public.alumni for insert with check (public.is_admin());
create policy "alumni_delete_admin" on public.alumni for delete using (public.is_admin());
