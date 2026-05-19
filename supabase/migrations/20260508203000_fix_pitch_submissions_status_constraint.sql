-- Align pitch_submissions.status with current app flow.
-- Existing environments may still have old constraint: ('pending','approved','rejected').

-- Normalize transitional values before tightening constraint.
update public.pitch_submissions
set status = 'pending'
where status in ('pending_review', 'submitted');

update public.pitch_submissions
set status = 'approved'
where status in ('live', 'reviewed');

alter table public.pitch_submissions
drop constraint if exists pitch_submissions_status_check;

alter table public.pitch_submissions
add constraint pitch_submissions_status_check
check (status in ('draft', 'pending', 'approved', 'rejected'));
