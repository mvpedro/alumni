create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0
);
alter table public.sectors enable row level security;
