-- Allow authenticated users to create their own row in public.users.
-- Required for founder pitch flow where we upsert current auth user before startup insert.

alter table public.users enable row level security;

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
  on public.users
  for insert
  to authenticated
  with check (id = auth.uid());
