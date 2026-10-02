-- Oportunidades: job/internship board. Approved users submit (pending), admins publish.

create or replace function public.is_approved()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$ language sql security definer stable;

create table public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_id uuid references public.companies(id) on delete set null,
  company_name text,
  area text not null default 'engenharia'
    check (area in ('engenharia', 'software', 'dados', 'produto', 'gestao', 'pesquisa', 'outro')),
  job_type text not null default 'clt'
    check (job_type in ('clt', 'pj', 'estagio', 'trainee', 'freelance', 'outro')),
  work_mode text not null default 'presencial'
    check (work_mode in ('presencial', 'hibrido', 'remoto')),
  location text,
  salary_min numeric(10, 2),
  salary_max numeric(10, 2),
  description text not null,
  activities text,
  requirements text,
  apply_url text,
  apply_email text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected', 'closed')),
  published_at timestamptz,
  -- admin-only: when the post was shared on the mailing list / WhatsApp group
  email_sent_at timestamptz,
  whatsapp_sent_at timestamptz,
  expires_at date not null default (current_date + 60),
  posted_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oportunidades_company check (company_id is not null or nullif(trim(company_name), '') is not null),
  constraint oportunidades_apply check (apply_url is not null or apply_email is not null),
  constraint oportunidades_salary check (salary_min is null or salary_max is null or salary_min <= salary_max)
);

create index oportunidades_listing_idx on public.oportunidades (status, expires_at, published_at desc);

create trigger oportunidades_updated_at
  before update on public.oportunidades
  for each row execute function public.handle_updated_at();

-- Non-admins cannot moderate (status) or reassign ownership; published_at is
-- stamped the first time a post goes live.
create or replace function public.oportunidades_guard()
returns trigger as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.posted_by := auth.uid();
      new.email_sent_at := null;
      new.whatsapp_sent_at := null;
    else
      -- owners may close their own post; any other edit goes back to review
      if new.status <> 'closed' then
        new.status := 'pending';
      end if;
      new.posted_by := old.posted_by;
      new.published_at := old.published_at;
      new.email_sent_at := old.email_sent_at;
      new.whatsapp_sent_at := old.whatsapp_sent_at;
    end if;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger oportunidades_guard
  before insert or update on public.oportunidades
  for each row execute function public.oportunidades_guard();

alter table public.oportunidades enable row level security;

create policy "oportunidades_read" on public.oportunidades for select using (
  (status = 'published' and expires_at >= current_date)
  or posted_by = auth.uid()
  or public.is_admin()
);
create policy "oportunidades_insert" on public.oportunidades for insert with check (
  public.is_admin() or public.is_approved()
);
create policy "oportunidades_update" on public.oportunidades for update using (
  public.is_admin() or posted_by = auth.uid()
);
create policy "oportunidades_delete" on public.oportunidades for delete using (
  public.is_admin() or posted_by = auth.uid()
);
