-- Pitch flow tables for founder submission workspace.

create table if not exists public.founders (
  user_id uuid primary key references public.users (id) on delete cascade,
  bio text,
  linkedin_url text,
  experience text,
  team_members text,
  updated_at timestamptz not null default now()
);

create table if not exists public.pitches (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewed')),
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (founder_id)
);

create table if not exists public.pitch_files (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches (id) on delete cascade,
  founder_id uuid not null references public.users (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists pitch_files_pitch_idx on public.pitch_files (pitch_id);
create index if not exists pitches_founder_idx on public.pitches (founder_id);

alter table public.founders enable row level security;
alter table public.pitches enable row level security;
alter table public.pitch_files enable row level security;

drop policy if exists "founders_own_all" on public.founders;
create policy "founders_own_all"
  on public.founders
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "pitches_own_all" on public.pitches;
create policy "pitches_own_all"
  on public.pitches
  for all
  to authenticated
  using (founder_id = auth.uid())
  with check (founder_id = auth.uid());

drop policy if exists "pitch_files_own_all" on public.pitch_files;
create policy "pitch_files_own_all"
  on public.pitch_files
  for all
  to authenticated
  using (founder_id = auth.uid())
  with check (founder_id = auth.uid());
