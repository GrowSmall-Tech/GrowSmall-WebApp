-- Role auth hardening: canonical profiles schema + role-aware RLS.
-- Safe to run even if investor-specific tables are not created yet.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('founder', 'investor')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamptz not null default now();

-- Ensure profiles.id always references auth.users(id), not public.users(id).
do $$
declare
  rec record;
  has_auth_fk boolean := false;
begin
  -- Drop ANY FK on profiles.id that points to public.users.
  for rec in
    select c.conname, c.confrelid::regclass::text as target
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'profiles'
      and c.contype = 'f'
      and c.conkey = array[
        (
          select a.attnum
          from pg_attribute a
          join pg_class t2 on t2.oid = a.attrelid
          join pg_namespace n2 on n2.oid = t2.relnamespace
          where n2.nspname = 'public'
            and t2.relname = 'profiles'
            and a.attname = 'id'
            and a.attisdropped = false
          limit 1
        )
      ]
  loop
    if rec.target = 'public.users' then
      execute format('alter table public.profiles drop constraint %I', rec.conname);
    elsif rec.target = 'auth.users' then
      has_auth_fk := true;
    end if;
  end loop;

  if not has_auth_fk then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;
end $$;

update public.profiles p
set
  email = coalesce(p.email, au.email, pu.email, ''),
  full_name = coalesce(
    p.full_name,
    nullif(au.raw_user_meta_data ->> 'full_name', ''),
    pu.full_name
  ),
  avatar_url = coalesce(
    p.avatar_url,
    nullif(au.raw_user_meta_data ->> 'avatar_url', ''),
    pu.avatar_url
  ),
  role = case
    when p.role in ('founder', 'investor') then p.role
    when (au.raw_user_meta_data ->> 'role') = 'investor' then 'investor'
    when (au.raw_user_meta_data ->> 'role') = 'founder' then 'founder'
    when pu.role = 'investor' then 'investor'
    else 'founder'
  end
from auth.users au
left join public.users pu on pu.id = au.id
where au.id = p.id;

insert into public.profiles (id, email, full_name, role, avatar_url)
select
  au.id,
  coalesce(au.email, pu.email, ''),
  coalesce(nullif(au.raw_user_meta_data ->> 'full_name', ''), pu.full_name),
  case
    when (au.raw_user_meta_data ->> 'role') = 'investor' then 'investor'
    when (au.raw_user_meta_data ->> 'role') = 'founder' then 'founder'
    when pu.role = 'investor' then 'investor'
    else 'founder'
  end,
  coalesce(nullif(au.raw_user_meta_data ->> 'avatar_url', ''), pu.avatar_url)
from auth.users au
left join public.users pu on pu.id = au.id
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
  role = excluded.role;

-- Explicit role mapping for current users.
update public.profiles
set role = 'founder'
where email = 'gamingmafiaop@gmail.com';

update public.profiles
set role = 'investor'
where email = 'sumitkumar9088449734@gmail.com';

-- Ensure explicit mapping rows exist even if not present before.
insert into public.profiles (id, email, full_name, role, avatar_url)
select
  au.id,
  au.email,
  coalesce(nullif(au.raw_user_meta_data ->> 'full_name', ''), pu.full_name),
  case
    when au.email = 'gamingmafiaop@gmail.com' then 'founder'
    when au.email = 'sumitkumar9088449734@gmail.com' then 'investor'
    else case
      when (au.raw_user_meta_data ->> 'role') = 'investor' then 'investor'
      when (au.raw_user_meta_data ->> 'role') = 'founder' then 'founder'
      when pu.role = 'investor' then 'investor'
      else 'founder'
    end
  end,
  coalesce(nullif(au.raw_user_meta_data ->> 'avatar_url', ''), pu.avatar_url)
from auth.users au
left join public.users pu on pu.id = au.id
where au.email in (
  'gamingmafiaop@gmail.com',
  'sumitkumar9088449734@gmail.com'
)
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
  role = excluded.role;

alter table public.profiles alter column email set not null;
alter table public.profiles enable row level security;

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
    from information_schema.tables
    where table_schema = 'public' and table_name = 'saved_startups'
  ) then
    execute 'drop policy if exists "saved_startups_own_all" on public.saved_startups';
    execute 'drop policy if exists "saved_startups_investor_only" on public.saved_startups';
    execute $sql$
      create policy "saved_startups_investor_only"
        on public.saved_startups
        for all
        to authenticated
        using (
          investor_id = auth.uid()
          and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'investor'
          )
        )
        with check (
          investor_id = auth.uid()
          and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'investor'
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
    where table_schema = 'public' and table_name = 'investment_tx'
  ) then
    execute 'drop policy if exists "investment_tx_own_all" on public.investment_tx';
    execute 'drop policy if exists "investment_tx_investor_only" on public.investment_tx';
    execute $sql$
      create policy "investment_tx_investor_only"
        on public.investment_tx
        for all
        to authenticated
        using (
          investor_id = auth.uid()
          and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'investor'
          )
        )
        with check (
          investor_id = auth.uid()
          and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'investor'
          )
        )
    $sql$;
  end if;
end $$;

drop policy if exists "Founders update own startup" on public.startups;
create policy "founders_update_own_startup_role_checked"
  on public.startups
  for update
  to authenticated
  using (
    founder_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'founder'
    )
  )
  with check (
    founder_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'founder'
    )
  );
