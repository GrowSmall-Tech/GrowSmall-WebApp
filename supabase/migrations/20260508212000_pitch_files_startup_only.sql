-- pitch_files historically mixed two shapes:
--   • 20260507234500: pitch_id + founder_id NOT NULL (legacy `pitches` table)
--   • 20260508181000: startup_id + file_url (current app)
-- When the old table existed first, later migration only ADDed columns — leaving
-- pitch_id NOT NULL and causing 23502 on submit inserts that omit pitch_id.
--
-- Relax legacy constraints and drop the obsolete FK so startup-centric rows work.

alter table public.pitch_files
  add column if not exists startup_id uuid references public.startups (id) on delete cascade,
  add column if not exists file_name text,
  add column if not exists file_url text,
  add column if not exists file_type text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pitch_files' and column_name = 'pitch_id'
  ) then
    alter table public.pitch_files drop constraint if exists pitch_files_pitch_id_fkey;
    alter table public.pitch_files alter column pitch_id drop not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pitch_files' and column_name = 'founder_id'
  ) then
    alter table public.pitch_files alter column founder_id drop not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pitch_files' and column_name = 'file_path'
  ) then
    alter table public.pitch_files alter column file_path drop not null;
  end if;
end $$;

do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then null;
end $$;
