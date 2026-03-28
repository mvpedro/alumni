create or replace function public.handle_new_user()
returns trigger as $$
declare
  matched_alumni_id uuid;
  new_user_type text;
begin
  new_user_type := coalesce(new.raw_user_meta_data->>'user_type', 'alumni');

  -- Create the profile with user_type
  insert into public.profiles (id, full_name, entry_class, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'entry_class', ''),
    new_user_type
  );

  -- Try to match an existing alumni record by email
  select id into matched_alumni_id
  from public.alumni
  where contact_email = new.email
    and profile_id is null
  limit 1;

  if matched_alumni_id is not null then
    update public.alumni
    set profile_id = new.id,
        is_graduando = (new_user_type = 'graduando'),
        expected_graduation = new.raw_user_meta_data->>'expected_graduation'
    where id = matched_alumni_id;
  else
    insert into public.alumni (full_name, entry_class, contact_email, profile_id, is_graduando, expected_graduation)
    values (
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'entry_class', ''),
      new.email,
      new.id,
      new_user_type = 'graduando',
      new.raw_user_meta_data->>'expected_graduation'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;
