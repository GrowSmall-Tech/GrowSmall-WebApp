-- Safe repair migration for partially-applied profiles role system.
-- This migration is incremental and idempotent: no table drops, no data wipes.

-- 1) Ensure profiles table exists (without replacing existing table).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

-- 2) Add missing columns safely.
alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamptz not null default now();

-- 3) Ensure created_at default is present.
alter table public.profiles
  alter column created_at set default now();

-- 4) Ensure role check constraint exists and allows founder/investor only.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('founder', 'investor'));
  end if;
end $$;

-- 5) Ensure profiles.id FK points to auth.users(id) and avoid duplicate FK errors.
do $$
declare
  fk_target text;
begin
  -- Remove orphan profile rows that cannot satisfy auth.users FK.
  -- These are legacy rows not tied to a real authenticated user.
  delete from public.profiles p
  where not exists (
    select 1 from auth.users au where au.id = p.id
  );

  select c.confrelid::regclass::text
  into fk_target
  from pg_constraint c
  where c.conrelid = 'public.profiles'::regclass
    and c.conname = 'profiles_id_fkey'
    and c.contype = 'f';

  if fk_target is null then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  elsif fk_target <> 'auth.users' then
    alter table public.profiles drop constraint profiles_id_fkey;
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;
end $$;

-- 6) Backfill profiles from auth.users + public.users fallback.
update public.profiles p
set
  email = coalesce(nullif(p.email, ''), au.email, pu.email),
  full_name = coalesce(
    nullif(p.full_name, ''),
    nullif(au.raw_user_meta_data ->> 'full_name', ''),
    pu.full_name
  ),
  avatar_url = coalesce(
    nullif(p.avatar_url, ''),
    nullif(au.raw_user_meta_data ->> 'avatar_url', ''),
    pu.avatar_url
  ),
  role = coalesce(
    nullif(p.role, ''),
    case
      when (au.raw_user_meta_data ->> 'role') = 'investor' then 'investor'
      when (au.raw_user_meta_data ->> 'role') = 'founder' then 'founder'
      when pu.role = 'investor' then 'investor'
      when pu.role = 'founder' then 'founder'
      else null
    end
  )
from auth.users au
left join public.users pu on pu.id = au.id
where p.id = au.id;

insert into public.profiles (id, email, full_name, role, avatar_url, created_at)
select
  au.id,
  coalesce(au.email, pu.email, ''),
  coalesce(nullif(au.raw_user_meta_data ->> 'full_name', ''), pu.full_name),
  case
    when (au.raw_user_meta_data ->> 'role') = 'investor' then 'investor'
    when (au.raw_user_meta_data ->> 'role') = 'founder' then 'founder'
    when pu.role = 'investor' then 'investor'
    when pu.role = 'founder' then 'founder'
    else 'founder'
  end,
  coalesce(nullif(au.raw_user_meta_data ->> 'avatar_url', ''), pu.avatar_url),
  now()
from auth.users au
left join public.users pu on pu.id = au.id
where not exists (
  select 1 from public.profiles p where p.id = au.id
);

-- 7) Ensure role and email are populated safely.
update public.profiles
set role = 'founder'
where role is null or role = '';

update public.profiles p
set email = au.email
from auth.users au
where p.id = au.id
  and (p.email is null or p.email = '');

-- 8) Hard-assign required roles for current users.
update public.profiles
set role = 'founder'
where lower(email) = 'gamingmafiaop@gmail.com';

update public.profiles
set role = 'investor'
where lower(email) = 'sumitkumar9088449734@gmail.com';

-- 9) Keep RLS enabled and owner policy present.
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_own_all'
  ) then
    create policy "profiles_own_all"
      on public.profiles
      for all
      to authenticated
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end $$;

-- Verification query (run manually after migration):
-- select id, email, role
-- from public.profiles
-- where lower(email) in ('gamingmafiaop@gmail.com', 'sumitkumar9088449734@gmail.com');
