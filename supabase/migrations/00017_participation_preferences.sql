alter table public.alumni add column if not exists open_to_trabalho_alumni boolean not null default false;
alter table public.alumni add column if not exists open_to_text_interview boolean not null default false;
alter table public.alumni add column if not exists open_to_alumni_talk boolean not null default false;
alter table public.alumni add column if not exists open_to_semana_academica boolean not null default false;
