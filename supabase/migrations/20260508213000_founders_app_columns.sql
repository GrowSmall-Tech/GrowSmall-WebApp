-- Legacy `founders` from 20260507234500 only has user_id, bio, linkedin_url, etc.
-- The app upserts founder_name, email, linkedin (see pitch.ts + founder.ts).
-- PostgREST returns PGRST204 when those columns are missing from the live table.

alter table public.founders
  add column if not exists founder_name text,
  add column if not exists email text,
  add column if not exists linkedin text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'founders' and column_name = 'linkedin_url'
  ) then
    execute $bk$
      update public.founders
      set linkedin = coalesce(linkedin, linkedin_url)
      where linkedin is null and linkedin_url is not null
    $bk$;
  end if;
end $$;

do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then null;
end $$;
