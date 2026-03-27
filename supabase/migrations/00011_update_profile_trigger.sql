-- Update the new user trigger to also create an alumni record and link it
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_profile_id uuid;
  matched_alumni_id uuid;
begin
  -- Create the profile
  insert into public.profiles (id, full_name, entry_class)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'entry_class', '')
  );

  -- Try to match an existing alumni record by email
  select id into matched_alumni_id
  from public.alumni
  where contact_email = new.email
    and profile_id is null
  limit 1;

  if matched_alumni_id is not null then
    -- Link existing alumni record to new profile
    update public.alumni
    set profile_id = new.id
    where id = matched_alumni_id;
  else
    -- Create a new alumni record linked to the profile
    insert into public.alumni (full_name, entry_class, contact_email, profile_id)
    values (
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'entry_class', ''),
      new.email,
      new.id
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;
