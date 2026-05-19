-- Investor dashboard working tables + RLS + realtime.

create table if not exists public.saved_startups (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users (id) on delete cascade,
  startup_id uuid not null references public.startups (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (investor_id, startup_id)
);

create table if not exists public.investment_tx (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users (id) on delete cascade,
  startup_id uuid not null references public.startups (id) on delete cascade,
  amount numeric not null,
  equity_percent numeric,
  roi_percent numeric,
  status text not null default 'active' check (status in ('active', 'exited', 'watching')),
  invested_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'system' check (type in ('startup', 'pitch', 'investment', 'milestone', 'system')),
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.investor_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  bio text,
  avatar_url text,
  phone text,
  focus_sectors text[],
  cheque_size_min numeric,
  cheque_size_max numeric,
  email_updates boolean not null default true,
  push_updates boolean not null default true,
  kyc_status text not null default 'pending' check (kyc_status in ('pending', 'submitted', 'verified')),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users (id) on delete cascade,
  startup_id uuid references public.startups (id) on delete set null,
  title text not null,
  category text not null check (category in ('pitch_deck', 'legal', 'due_diligence')),
  file_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.users (id) on delete cascade,
  invitee_email text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists public.investor_activity (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users (id) on delete cascade,
  startup_id uuid references public.startups (id) on delete set null,
  action text not null check (
    action in (
      'viewed_startup',
      'saved_startup',
      'unsaved_startup',
      'investment_added',
      'profile_updated',
      'document_uploaded'
    )
  ),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists saved_startups_investor_idx on public.saved_startups (investor_id);
create index if not exists investment_tx_investor_idx on public.investment_tx (investor_id, invested_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists documents_investor_idx on public.documents (investor_id, created_at desc);
create index if not exists invitations_inviter_idx on public.invitations (inviter_id, created_at desc);
create index if not exists investor_activity_investor_idx on public.investor_activity (investor_id, created_at desc);

alter table public.saved_startups enable row level security;
alter table public.investment_tx enable row level security;
alter table public.notifications enable row level security;
alter table public.investor_profiles enable row level security;
alter table public.documents enable row level security;
alter table public.invitations enable row level security;
alter table public.investor_activity enable row level security;

drop policy if exists "saved_startups_own_all" on public.saved_startups;
create policy "saved_startups_own_all"
  on public.saved_startups
  for all
  to authenticated
  using (investor_id = auth.uid())
  with check (investor_id = auth.uid());

drop policy if exists "investment_tx_own_all" on public.investment_tx;
create policy "investment_tx_own_all"
  on public.investment_tx
  for all
  to authenticated
  using (investor_id = auth.uid())
  with check (investor_id = auth.uid());

drop policy if exists "notifications_own_all" on public.notifications;
create policy "notifications_own_all"
  on public.notifications
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "investor_profiles_own_all" on public.investor_profiles;
create policy "investor_profiles_own_all"
  on public.investor_profiles
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "documents_own_all" on public.documents;
create policy "documents_own_all"
  on public.documents
  for all
  to authenticated
  using (investor_id = auth.uid())
  with check (investor_id = auth.uid());

drop policy if exists "invitations_inviter_all" on public.invitations;
create policy "invitations_inviter_all"
  on public.invitations
  for all
  to authenticated
  using (inviter_id = auth.uid())
  with check (inviter_id = auth.uid());

drop policy if exists "investor_activity_own_insert_select" on public.investor_activity;
create policy "investor_activity_own_insert_select"
  on public.investor_activity
  for all
  to authenticated
  using (investor_id = auth.uid())
  with check (investor_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('investor-documents', 'investor-documents', false)
on conflict (id) do nothing;

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

alter table public.saved_startups replica identity full;
alter table public.investment_tx replica identity full;
alter table public.notifications replica identity full;
alter table public.documents replica identity full;
alter table public.investor_activity replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.saved_startups;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.investment_tx;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.documents;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.investor_activity;
exception
  when duplicate_object then null;
end $$;
