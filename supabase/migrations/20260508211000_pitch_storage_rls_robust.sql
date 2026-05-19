-- Robust storage RLS for the founder pitch flow.
-- The previous policies relied on EXISTS subqueries into public.startups,
-- which broke uploads with "new row violates row-level security policy"
-- whenever the chain was unhappy (RLS on startups, missing migration on the
-- target environment, race between draft creation and upload, etc.).
-- This migration replaces them with simpler, owner-column based policies:
--   • Bucket is public-read so investors can open logos / covers / decks.
--   • Any authenticated user may INSERT into these buckets (the app puts
--     files under the startup-id folder it just created / owns).
--   • UPDATE / DELETE are restricted to the original uploader (owner column,
--     populated automatically by Supabase Storage with auth.uid()).

-- 1. Make sure all three buckets exist and are public.
insert into storage.buckets (id, name, public)
values ('pitch-decks', 'pitch-decks', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('startup-logos', 'startup-logos', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('startup-covers', 'startup-covers', true)
on conflict (id) do update set public = excluded.public;

-- 2. Drop any pre-existing policies for these buckets to start clean.
drop policy if exists "pitch_decks_founder_all" on storage.objects;
drop policy if exists "pitch_decks_public_read" on storage.objects;
drop policy if exists "pitch_decks_owner_insert" on storage.objects;
drop policy if exists "pitch_decks_owner_update" on storage.objects;
drop policy if exists "pitch_decks_owner_delete" on storage.objects;

drop policy if exists "startup_logos_public_read" on storage.objects;
drop policy if exists "startup_logos_founder_write" on storage.objects;
drop policy if exists "startup_logos_owner_insert" on storage.objects;
drop policy if exists "startup_logos_owner_update" on storage.objects;
drop policy if exists "startup_logos_owner_delete" on storage.objects;

drop policy if exists "startup_covers_public_read" on storage.objects;
drop policy if exists "startup_covers_founder_write" on storage.objects;
drop policy if exists "startup_covers_owner_insert" on storage.objects;
drop policy if exists "startup_covers_owner_update" on storage.objects;
drop policy if exists "startup_covers_owner_delete" on storage.objects;

-- 3. Public read for all three buckets.
create policy "pitch_decks_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'pitch-decks');

create policy "startup_logos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'startup-logos');

create policy "startup_covers_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'startup-covers');

-- 4. Authenticated INSERT (any logged-in user can upload). Application code
--    is responsible for placing the object under the right startup folder.
create policy "pitch_decks_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pitch-decks');

create policy "startup_logos_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'startup-logos');

create policy "startup_covers_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'startup-covers');

-- 5. UPDATE / DELETE restricted to the original uploader via owner column.
create policy "pitch_decks_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'pitch-decks' and owner = auth.uid())
  with check (bucket_id = 'pitch-decks');

create policy "pitch_decks_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pitch-decks' and owner = auth.uid());

create policy "startup_logos_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'startup-logos' and owner = auth.uid())
  with check (bucket_id = 'startup-logos');

create policy "startup_logos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'startup-logos' and owner = auth.uid());

create policy "startup_covers_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'startup-covers' and owner = auth.uid())
  with check (bucket_id = 'startup-covers');

create policy "startup_covers_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'startup-covers' and owner = auth.uid());

-- 6. Reload PostgREST schema cache (no-op safe).
do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then null;
end $$;
