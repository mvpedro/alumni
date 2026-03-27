-- Allow alumni to control which contact info is visible on their profile
alter table public.alumni add column if not exists show_email boolean not null default false;
alter table public.alumni add column if not exists show_linkedin boolean not null default true;
