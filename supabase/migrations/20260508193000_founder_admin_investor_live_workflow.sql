-- Founder -> Admin -> Investor marketplace workflow hardening.
-- Normalizes startup lifecycle states and adds review/interest tables.

create extension if not exists "pgcrypto";

alter table public.startups
  add column if not exists website text,
  add column if not exists cover_image_url text,
  add column if not exists monthly_revenue numeric,
  add column if not exists yearly_revenue numeric,
  add column if not exists traction text,
  add column if not exists pitch_deck_url text,
  add column if not exists rejection_reason text,
  add column if not exists views_count integer not null default 0,
  add column if not exists investor_interest_count integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

-- Keep aliases in sync where older code still uses banner_url/annual_revenue.
update public.startups
set
  cover_image_url = coalesce(cover_image_url, banner_url),
  yearly_revenue = coalesce(yearly_revenue, annual_revenue),
  monthly_revenue = coalesce(monthly_revenue, (annual_revenue / 12.0))
where true;

do $$
declare
  startup_status_constraint text;
begin
  select conname into startup_status_constraint
  from pg_constraint
  where conrelid = 'public.startups'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';

  if startup_status_constraint is not null then
    execute format('alter table public.startups drop constraint %I', startup_status_constraint);
  end if;
end $$;

alter table public.startups
  add constraint startups_status_check
  check (status in ('draft', 'pending_review', 'approved', 'rejected', 'live'));

update public.startups
set status = case
  when status = 'pending' then 'pending_review'
  when status = 'approved' then 'live'
  else status
end
where status in ('pending', 'approved');

create table if not exists public.admin_reviews (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  admin_id uuid not null references public.users (id) on delete cascade,
  action text not null check (action in ('approved', 'rejected', 'requested_changes', 'featured')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists admin_reviews_startup_idx on public.admin_reviews (startup_id, created_at desc);

create table if not exists public.investment_requests (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users (id) on delete cascade,
  startup_id uuid not null references public.startups (id) on delete cascade,
  amount_interest numeric,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'closed')),
  created_at timestamptz not null default now(),
  unique (investor_id, startup_id)
);

create index if not exists investment_requests_startup_idx on public.investment_requests (startup_id, created_at desc);

alter table public.startup_metrics
  add column if not exists users numeric,
  add column if not exists growth_rate numeric,
  add column if not exists burn_rate numeric;

update public.startup_metrics
set users = coalesce(users, users_growth)
where users is null;

alter table public.admin_reviews enable row level security;
alter table public.investment_requests enable row level security;

drop policy if exists "startups_select_approved_or_owned" on public.startups;
create policy "startups_select_live_or_owned"
  on public.startups
  for select
  to anon, authenticated
  using (
    status = 'live'
    or founder_id = auth.uid()
  );

drop policy if exists "users_public_read_founders" on public.users;
create policy "users_public_read_live_founders"
  on public.users
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.startups s
      where s.founder_id = users.id
        and s.status = 'live'
    )
  );

drop policy if exists "pitch_select_visible" on public.pitch_submissions;
create policy "pitch_select_visible"
  on public.pitch_submissions
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.startups s
      where s.id = pitch_submissions.startup_id
        and (s.status = 'live' or s.founder_id = auth.uid())
    )
  );

drop policy if exists "investment_requests_investor_insert" on public.investment_requests;
create policy "investment_requests_investor_insert"
  on public.investment_requests
  for insert
  to authenticated
  with check (investor_id = auth.uid());

drop policy if exists "investment_requests_investor_select" on public.investment_requests;
create policy "investment_requests_investor_select"
  on public.investment_requests
  for select
  to authenticated
  using (
    investor_id = auth.uid()
    or exists (
      select 1
      from public.startups s
      where s.id = investment_requests.startup_id
        and s.founder_id = auth.uid()
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.investment_requests;
exception
  when duplicate_object then null;
end $$;
