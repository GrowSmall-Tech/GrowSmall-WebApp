-- Founder workspace core schema (drafts, submissions, funding, docs, invites).

create table if not exists public.founders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  founder_name text,
  email text,
  linkedin text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references public.users (id) on delete cascade,
  role text not null default 'founder' check (role in ('founder', 'investor', 'admin')),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, role)
select u.id, u.role
from public.users u
on conflict (id) do nothing;

alter table public.startups
  add column if not exists startup_name text,
  add column if not exists revenue numeric,
  add column if not exists founder_workspace_views integer not null default 0,
  add column if not exists founder_workspace_bookmarks integer not null default 0;

update public.startups
set startup_name = name
where startup_name is null;

alter table public.startups
  add column if not exists founder_id uuid references public.users (id) on delete set null;

alter table public.pitch_submissions
  add column if not exists startup_id uuid references public.startups (id) on delete cascade,
  add column if not exists step_completed integer not null default 1,
  add column if not exists current_step integer not null default 1,
  add column if not exists submission_status text not null default 'draft' check (submission_status in ('draft', 'under_review', 'approved', 'rejected')),
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.pitch_files (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  created_at timestamptz not null default now()
);

alter table public.pitch_files
  add column if not exists startup_id uuid references public.startups (id) on delete cascade,
  add column if not exists file_name text,
  add column if not exists file_url text,
  add column if not exists file_type text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists pitch_files_startup_idx on public.pitch_files (startup_id);

create table if not exists public.funding_history (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  amount numeric not null,
  investor_name text not null,
  round_type text not null,
  created_at timestamptz not null default now()
);

alter table public.funding_history
  add column if not exists startup_id uuid references public.startups (id) on delete cascade,
  add column if not exists amount numeric,
  add column if not exists investor_name text,
  add column if not exists round_type text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists funding_history_startup_idx on public.funding_history (startup_id, created_at desc);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references public.users (id) on delete cascade,
  startup_id uuid references public.startups (id) on delete set null,
  founder_id uuid references public.users (id) on delete cascade,
  title text,
  category text,
  file_path text,
  mime_type text,
  size_bytes bigint,
  document_name text,
  document_url text,
  document_type text,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'documents'
  ) then
    execute 'alter table public.documents alter column investor_id drop not null';
    execute $sql$
      alter table public.documents
        add column if not exists founder_id uuid references public.users (id) on delete cascade,
        add column if not exists document_name text,
        add column if not exists document_url text,
        add column if not exists document_type text,
        add column if not exists uploaded_at timestamptz not null default now()
    $sql$;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'documents' and column_name = 'title'
    ) and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'documents' and column_name = 'file_path'
    ) and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'documents' and column_name = 'category'
    ) and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'documents' and column_name = 'created_at'
    ) then
      execute $sql$
        update public.documents
        set
          document_name = coalesce(document_name, title),
          document_url = coalesce(document_url, file_path),
          document_type = coalesce(document_type, category),
          uploaded_at = coalesce(uploaded_at, created_at)
      $sql$;
    end if;
  end if;
end $$;

create table if not exists public.founder_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz not null default now()
);

create index if not exists founder_invites_invited_by_idx on public.founder_invites (invited_by, created_at desc);

insert into storage.buckets (id, name, public)
values ('founder-documents', 'founder-documents', false)
on conflict (id) do nothing;

alter table public.founders enable row level security;
alter table public.profiles enable row level security;
alter table public.pitch_files enable row level security;
alter table public.funding_history enable row level security;
alter table public.founder_invites enable row level security;

drop policy if exists "founders_own_all_v2" on public.founders;
create policy "founders_own_all_v2"
  on public.founders
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "profiles_own_all" on public.profiles;
create policy "profiles_own_all"
  on public.profiles
  for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pitch_submissions'
      and column_name = 'startup_id'
  ) then
    execute 'drop policy if exists "pitch_submissions_founder_all" on public.pitch_submissions';
    execute $sql$
      create policy "pitch_submissions_founder_all"
        on public.pitch_submissions
        for all
        to authenticated
        using (
          exists (
            select 1
            from public.startups s
            where s.id = pitch_submissions.startup_id
              and s.founder_id = auth.uid()
          )
        )
        with check (
          exists (
            select 1
            from public.startups s
            where s.id = pitch_submissions.startup_id
              and s.founder_id = auth.uid()
          )
        )
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pitch_files'
      and column_name = 'startup_id'
  ) then
    execute 'drop policy if exists "pitch_files_founder_all_v2" on public.pitch_files';
    execute $sql$
      create policy "pitch_files_founder_all_v2"
        on public.pitch_files
        for all
        to authenticated
        using (
          exists (
            select 1 from public.startups s
            where s.id = pitch_files.startup_id and s.founder_id = auth.uid()
          )
        )
        with check (
          exists (
            select 1 from public.startups s
            where s.id = pitch_files.startup_id and s.founder_id = auth.uid()
          )
        )
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'funding_history'
      and column_name = 'startup_id'
  ) then
    execute 'drop policy if exists "funding_history_founder_all" on public.funding_history';
    execute $sql$
      create policy "funding_history_founder_all"
        on public.funding_history
        for all
        to authenticated
        using (
          exists (
            select 1 from public.startups s
            where s.id = funding_history.startup_id and s.founder_id = auth.uid()
          )
        )
        with check (
          exists (
            select 1 from public.startups s
            where s.id = funding_history.startup_id and s.founder_id = auth.uid()
          )
        )
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'documents'
  ) then
    execute 'drop policy if exists "documents_founder_all" on public.documents';
    execute $sql$
      create policy "documents_founder_all"
        on public.documents
        for all
        to authenticated
        using (founder_id = auth.uid() or investor_id = auth.uid())
        with check (founder_id = auth.uid() or investor_id = auth.uid())
    $sql$;
  end if;
end $$;

drop policy if exists "founder_invites_owner_all" on public.founder_invites;
create policy "founder_invites_owner_all"
  on public.founder_invites
  for all
  to authenticated
  using (invited_by = auth.uid())
  with check (invited_by = auth.uid());

drop policy if exists "founder_documents_owner_all" on storage.objects;
create policy "founder_documents_owner_all"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'founder-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'founder-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
