-- Fix: admins need to read ALL companies (not just approved) to manage them
drop policy if exists "companies_read" on public.companies;
create policy "companies_read" on public.companies for select using (
  status = 'approved' or public.is_admin()
);

-- Fix: add UPDATE policy for company-logos storage (needed for upsert)
create policy "company_logos_update" on storage.objects
  for update using (
    bucket_id = 'company-logos' and auth.uid() is not null
  );
