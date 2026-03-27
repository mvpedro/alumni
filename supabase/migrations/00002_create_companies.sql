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
