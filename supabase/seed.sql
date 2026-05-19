-- GrowSmall seed data (run on an empty database after migrations).
-- Adjust UUIDs if they collide with existing rows.

begin;

-- Users
insert into public.users (id, role, full_name, email, avatar_url, suspended)
values
  ('11111111-1111-1111-1111-111111111101'::uuid, 'founder', 'Ananya Sharma', 'ananya@bharat.example', null, false),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'founder', 'Raj Verma', 'raj@mumbai-finpay.example', null, false),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'founder', 'Priya Kulkarni', 'priya@pulse.example', null, false),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'investor', 'Demo Investor', 'investor@growsmall.example', null, false)
on conflict (email) do nothing;

-- Startups (amounts in INR)
insert into public.startups (
  id,
  slug,
  name,
  tagline,
  industry,
  location,
  category,
  description,
  problem,
  solution,
  funding_ask,
  valuation,
  equity_offered,
  annual_revenue,
  annual_profit,
  growth_rate,
  stage,
  founder_id,
  logo_url,
  banner_url,
  is_featured,
  is_trending,
  status
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    'bharat-agri-tech',
    'Bharat Agri-Tech',
    'IoT soil analytics and drip-irrigation automation for semi-arid regions.',
    'Agritech',
    'Mumbai, India',
    'agritech',
    'IoT soil analytics and drip-irrigation automation that helps growers cut water waste and lift yield across semi-arid regions.',
    'Fragmented supply chains reduce farmer margins.',
    'Direct marketplace plus forecasting stack built for Indian cooperatives.',
    6500000,
    450000000,
    10,
    120000000,
    12000000,
    140,
    'Series A',
    '11111111-1111-1111-1111-111111111101'::uuid,
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    true,
    true,
    'approved'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    'mumbai-finpay',
    'Mumbai FinPay',
    'Neo-banking stack for SMEs with escrow collections.',
    'FinTech',
    'Mumbai, India',
    'fintech',
    'Neo-banking stack for SMEs with escrow collections, automated reconciliations, and ledger-grade audit trails.',
    'Finance teams stitch multiple rails without audit-grade trails.',
    'Single API for virtual accounts, splits, and immutable ledgers.',
    12000000,
    150000000,
    8,
    180000000,
    21000000,
    96,
    'Seed',
    '11111111-1111-1111-1111-111111111102'::uuid,
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80',
    null,
    true,
    true,
    'approved'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
    'pulsehealth',
    'PulseHealth',
    'Outpatient engagement with vernacular triage.',
    'HealthTech',
    'Bengaluru, India',
    'healthtech',
    'Outpatient engagement platform with vernacular triage and insurer-ready diagnostics.',
    'Care coordination breaks across languages and insurers.',
    'Unified orchestration layer with FHIR-friendly exports.',
    36000000,
    320000000,
    12,
    264000000,
    42000000,
    110,
    'Series A',
    '11111111-1111-1111-1111-111111111103'::uuid,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=400&q=80',
    null,
    false,
    true,
    'approved'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
    'ledgerlane',
    'LedgerLane',
    'Embedded finance APIs for marketplaces.',
    'FinTech',
    'Bengaluru, India',
    'fintech',
    'Embedded finance APIs for marketplaces: split payouts, TDS handling, and partner KYC.',
    'Manual reconciliation slows marketplace payouts.',
    'Composable rails with split rules and tamper-evident logs.',
    55000000,
    480000000,
    6,
    372000000,
    54000000,
    88,
    'Series A',
    null,
    null,
    null,
    false,
    false,
    'pending'
  )
on conflict (slug) do nothing;

update public.users
set startup_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid
where id = '11111111-1111-1111-1111-111111111101'::uuid;

update public.users
set startup_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid
where id = '11111111-1111-1111-1111-111111111102'::uuid;

update public.users
set startup_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid
where id = '11111111-1111-1111-1111-111111111103'::uuid;

insert into public.startup_metrics (startup_id, month, revenue, users_growth)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 'Jan', 38, 28000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 'Feb', 41, 32000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 'Mar', 46, 38000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid, 'Jan', 120, 900),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid, 'Feb', 132, 1100),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid, 'Jan', 210, 4200);

insert into public.pitch_submissions (startup_id, pitch_deck_url, executive_summary, video_pitch_url, status)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    null,
    'Bharat Agri-Tech digitizes cooperative procurement with AI yield forecasts and buyer escrow.',
    null,
    'approved'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    null,
    'Mumbai FinPay unifies collections with virtual accounts and compliant splits for SME networks.',
    null,
    'approved'
  );

insert into public.investments (investor_id, startup_id, amount)
values
  (
    '22222222-2222-2222-2222-222222222201'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    2500000
  ),
  (
    '22222222-2222-2222-2222-222222222201'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    1800000
  );

commit;
