-- Store founder-provided graph series so detail pages render real data.
-- Also backfill columns the pitch form writes (business_model, target_market,
-- equity_offered) so saves stop tripping schema-cache errors.
alter table public.startups
  add column if not exists business_model text,
  add column if not exists target_market text,
  add column if not exists equity_offered numeric,
  add column if not exists revenue_graph jsonb,
  add column if not exists user_growth_graph jsonb;

-- Helpful indexes for the explore + detail surfaces hitting these columns.
create index if not exists startups_status_live_created_idx
  on public.startups (status, created_at desc);

-- Storage RLS for new logo / cover / deck buckets used by the founder pitch flow.
drop policy if exists "startup_logos_public_read" on storage.objects;
create policy "startup_logos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'startup-logos');

drop policy if exists "startup_logos_founder_write" on storage.objects;
create policy "startup_logos_founder_write"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'startup-logos'
    and exists (
      select 1 from public.startups s
      where s.id::text = (storage.foldername(name))[1]
        and s.founder_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'startup-logos'
    and exists (
      select 1 from public.startups s
      where s.id::text = (storage.foldername(name))[1]
        and s.founder_id = auth.uid()
    )
  );

drop policy if exists "startup_covers_public_read" on storage.objects;
create policy "startup_covers_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'startup-covers');

drop policy if exists "startup_covers_founder_write" on storage.objects;
create policy "startup_covers_founder_write"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'startup-covers'
    and exists (
      select 1 from public.startups s
      where s.id::text = (storage.foldername(name))[1]
        and s.founder_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'startup-covers'
    and exists (
      select 1 from public.startups s
      where s.id::text = (storage.foldername(name))[1]
        and s.founder_id = auth.uid()
    )
  );

-- Existing 'pitch-decks' bucket may be created as private; make it public
-- so investors can open the deck once a startup goes live.
update storage.buckets set public = true where id = 'pitch-decks';

drop policy if exists "pitch_decks_public_read" on storage.objects;
create policy "pitch_decks_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'pitch-decks');

-- Reload PostgREST schema cache so new columns become visible immediately.
do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then null;
end $$;
