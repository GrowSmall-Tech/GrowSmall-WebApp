-- Investor KYC approval workflow: profile columns, constraints, RLS, storage limits.

alter table public.profiles
  add column if not exists investor_status text default 'pending_approval',
  add column if not exists kyc_document_url text,
  add column if not exists income_certificate_url text,
  add column if not exists approved_by uuid,
  add column if not exists approved_at timestamptz,
  add column if not exists rejection_reason text;

-- Grandfather existing investors so current users retain dashboard access.
update public.profiles
set investor_status = 'approved'
where role = 'investor'
  and (investor_status is null or investor_status = 'pending_approval')
  and kyc_document_url is null
  and income_certificate_url is null;

alter table public.profiles
  alter column investor_status set default 'pending_approval';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_investor_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_investor_status_check
      check (
        investor_status is null
        or investor_status in ('pending_approval', 'approved', 'rejected')
      );
  end if;
end $$;

-- Investors must carry a status when role is investor.
update public.profiles
set investor_status = 'pending_approval'
where role = 'investor' and investor_status is null;

-- Storage bucket (private) — update limits for KYC uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'investor-documents',
  'investor-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Profiles RLS: replace blanket own-all with granular policies.
drop policy if exists "profiles_own_all" on public.profiles;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- Investors cannot self-approve; only non-status KYC fields on own row.
    and (
      role <> 'investor'
      or investor_status is not distinct from (
        select p.investor_status from public.profiles p where p.id = auth.uid()
      )
      or investor_status in ('pending_approval', 'rejected')
    )
  );

-- Service role (admin app) bypasses RLS; no extra policy required for admin updates.

-- Storage: owner can manage files under their user id folder (kyc/, income/, etc.).
drop policy if exists "investor_documents_owner_all" on storage.objects;
create policy "investor_documents_owner_all"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'investor-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'investor-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
