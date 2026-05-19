-- GrowSmall platform tables for admin + marketing surfaces.
-- Apply via Supabase SQL Editor or supabase db push.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('founder', 'investor', 'admin')),
  full_name text not null,
  email text not null unique,
  avatar_url text,
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text not null,
  description text,
  funding_ask numeric,
  revenue numeric,
  valuation numeric,
  stage text,
  founder_id uuid references public.users (id) on delete set null,
  is_featured boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists startups_status_idx on public.startups (status);
create index if not exists startups_featured_idx on public.startups (is_featured);
create index if not exists startups_slug_idx on public.startups (slug);

create table if not exists public.pitch_submissions (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  pitch_deck_url text,
  executive_summary text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now()
);

create index if not exists pitch_submissions_startup_idx on public.pitch_submissions (startup_id);

alter table public.users enable row level security;
alter table public.startups enable row level security;
alter table public.pitch_submissions enable row level security;

-- Public read access for approved startups (Explore, Featured sections).
drop policy if exists "Public read approved startups" on public.startups;
create policy "Public read approved startups"
  on public.startups
  for select
  to anon, authenticated
  using (status = 'approved');

-- Optional: allow anon read on pitch submissions linked to approved startups (future pitch previews).
drop policy if exists "Public read pitches for approved startups" on public.pitch_submissions;
create policy "Public read pitches for approved startups"
  on public.pitch_submissions
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = pitch_submissions.startup_id and s.status = 'approved'
    )
  );

-- Users profile rows remain restricted at database level (admin uses service role).
