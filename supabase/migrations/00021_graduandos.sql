-- Add user_type to profiles to distinguish alumni from graduandos
alter table public.profiles add column if not exists user_type text not null default 'alumni' check (user_type in ('alumni', 'graduando', 'admin'));

-- Add is_graduando flag to alumni table (graduandos get their own alumni record but are marked differently)
alter table public.alumni add column if not exists is_graduando boolean not null default false;
alter table public.alumni add column if not exists expected_graduation text;
