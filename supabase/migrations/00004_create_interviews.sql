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
