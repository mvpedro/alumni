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

alter table public.companies
  add constraint companies_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id);
