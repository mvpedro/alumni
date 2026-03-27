create policy "companies_insert_authenticated" on public.companies
  for insert with check (
    auth.uid() is not null and status = 'pending'
  );
