-- Keep pitch_submissions in sync when startups are already live/approved.
update public.pitch_submissions ps
set
  status = 'approved',
  submission_status = 'approved'
from public.startups s
where ps.startup_id = s.id
  and s.status in ('live', 'approved')
  and (ps.status is distinct from 'approved' or ps.submission_status is distinct from 'approved');
