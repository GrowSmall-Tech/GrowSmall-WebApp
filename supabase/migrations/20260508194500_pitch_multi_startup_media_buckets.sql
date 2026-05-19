-- Enable multiple startup submissions per founder and media buckets.

alter table public.pitch_submissions
  drop constraint if exists pitch_submissions_founder_id_key;

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('startup-logos', 'startup-logos', true)
  on conflict (id) do nothing;

  insert into storage.buckets (id, name, public)
  values ('startup-covers', 'startup-covers', true)
  on conflict (id) do nothing;

  insert into storage.buckets (id, name, public)
  values ('pitch-decks', 'pitch-decks', true)
  on conflict (id) do nothing;
end $$;
