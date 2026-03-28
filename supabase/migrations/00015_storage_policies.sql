-- Storage policies for avatars bucket
-- Allow authenticated users to upload their own avatar
create policy "avatars_upload" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
  );

-- Allow authenticated users to update their own avatar
create policy "avatars_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
  );

-- Allow public read of all avatars
create policy "avatars_read" on storage.objects
  for select using (
    bucket_id = 'avatars'
  );

-- Storage policies for company-logos bucket
-- Allow authenticated users to upload (for suggestions)
create policy "company_logos_upload" on storage.objects
  for insert with check (
    bucket_id = 'company-logos' and auth.uid() is not null
  );

create policy "company_logos_read" on storage.objects
  for select using (
    bucket_id = 'company-logos'
  );

-- Storage policies for blog-covers bucket
-- Admin-only upload (use is_admin check)
create policy "blog_covers_upload" on storage.objects
  for insert with check (
    bucket_id = 'blog-covers' and public.is_admin()
  );

create policy "blog_covers_update" on storage.objects
  for update using (
    bucket_id = 'blog-covers' and public.is_admin()
  );

create policy "blog_covers_read" on storage.objects
  for select using (
    bucket_id = 'blog-covers'
  );
