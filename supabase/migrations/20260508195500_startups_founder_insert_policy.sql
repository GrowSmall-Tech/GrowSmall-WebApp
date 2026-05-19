-- Fix founder pitch submission failure (RLS insert on startups).

alter table public.startups enable row level security;

drop policy if exists "Founders insert own startup" on public.startups;
create policy "Founders insert own startup"
  on public.startups
  for insert
  to authenticated
  with check (founder_id = auth.uid());
