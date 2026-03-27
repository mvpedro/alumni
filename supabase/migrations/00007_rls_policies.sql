create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$ language sql security definer;

-- SECTORS
create policy "sectors_read" on public.sectors for select using (true);
create policy "sectors_insert" on public.sectors for insert with check (public.is_admin());
create policy "sectors_update" on public.sectors for update using (public.is_admin());
create policy "sectors_delete" on public.sectors for delete using (public.is_admin());

-- COMPANIES
create policy "companies_read" on public.companies for select using (status = 'approved');
create policy "companies_insert" on public.companies for insert with check (public.is_admin());
create policy "companies_update" on public.companies for update using (public.is_admin());
create policy "companies_delete" on public.companies for delete using (public.is_admin());

-- PROFILES
create policy "profiles_read_approved" on public.profiles for select using (
  status = 'approved' or id = auth.uid() or public.is_admin()
);
create policy "profiles_insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());
create policy "profiles_delete_admin" on public.profiles for delete using (public.is_admin());

-- INTERVIEWS
create policy "interviews_read" on public.interviews for select using (published = true or public.is_admin());
create policy "interviews_insert" on public.interviews for insert with check (public.is_admin());
create policy "interviews_update" on public.interviews for update using (public.is_admin());
create policy "interviews_delete" on public.interviews for delete using (public.is_admin());

-- TRABALHO_ALUMNI
create policy "trabalho_read" on public.trabalho_alumni for select using (published = true or public.is_admin());
create policy "trabalho_insert" on public.trabalho_alumni for insert with check (public.is_admin());
create policy "trabalho_update" on public.trabalho_alumni for update using (public.is_admin());
create policy "trabalho_delete" on public.trabalho_alumni for delete using (public.is_admin());

-- CONTACT_MESSAGES
create policy "contact_insert" on public.contact_messages for insert with check (true);
create policy "contact_read" on public.contact_messages for select using (public.is_admin());
create policy "contact_update" on public.contact_messages for update using (public.is_admin());
create policy "contact_delete" on public.contact_messages for delete using (public.is_admin());
