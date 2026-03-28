-- Add alumni_id FK to interviews and trabalho_alumni
alter table public.interviews add column if not exists alumni_id uuid references public.alumni(id);
alter table public.trabalho_alumni add column if not exists alumni_id uuid references public.alumni(id);

-- Add semester column to trabalho_alumni for grouping
alter table public.trabalho_alumni add column if not exists semester text;
