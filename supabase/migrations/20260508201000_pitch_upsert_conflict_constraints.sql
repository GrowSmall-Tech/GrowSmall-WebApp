-- Fix ON CONFLICT errors in founder pitch flow.
-- App uses upsert(..., { onConflict: "startup_id" }) on pitch_submissions.

-- Remove duplicates first (keep most recent row per startup_id), then enforce uniqueness.
delete from public.pitch_submissions ps
where ps.id in (
  select d.id
  from (
    select
      id,
      row_number() over (
        partition by startup_id
        order by coalesce(submitted_at, created_at, now()) desc, created_at desc, id desc
      ) as rn
    from public.pitch_submissions
    where startup_id is not null
  ) as d
  where d.rn > 1
);

alter table public.pitch_submissions
  add constraint pitch_submissions_startup_id_key unique (startup_id);
