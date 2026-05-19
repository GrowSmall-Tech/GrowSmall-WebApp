-- GrowSmall extended schema: columns, metrics, investments, storage, RLS, realtime.
-- Apply after 20260507130000_platform_tables.sql

-- ---------------------------------------------------------------------------
-- startups: extend columns (rename revenue -> annual_revenue when present)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'startups' AND column_name = 'revenue'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'startups' AND column_name = 'annual_revenue'
  ) THEN
    ALTER TABLE public.startups RENAME COLUMN revenue TO annual_revenue;
  END IF;
END $$;

ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS problem text,
  ADD COLUMN IF NOT EXISTS solution text,
  ADD COLUMN IF NOT EXISTS equity_offered numeric,
  ADD COLUMN IF NOT EXISTS annual_profit numeric,
  ADD COLUMN IF NOT EXISTS growth_rate numeric,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS is_trending boolean NOT NULL DEFAULT false;

ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS annual_revenue numeric;

-- ---------------------------------------------------------------------------
-- users.startup_id (optional reverse link; FK added after startups exist)
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS startup_id uuid;

-- ---------------------------------------------------------------------------
-- startup_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startup_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups (id) ON DELETE CASCADE,
  month text NOT NULL,
  revenue numeric,
  users_growth numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS startup_metrics_startup_idx ON public.startup_metrics (startup_id);

-- ---------------------------------------------------------------------------
-- investments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  startup_id uuid NOT NULL REFERENCES public.startups (id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investments_investor_idx ON public.investments (investor_id);
CREATE INDEX IF NOT EXISTS investments_startup_idx ON public.investments (startup_id);

-- ---------------------------------------------------------------------------
-- pitch_submissions: video URL
-- ---------------------------------------------------------------------------
ALTER TABLE public.pitch_submissions
  ADD COLUMN IF NOT EXISTS video_pitch_url text;

-- ---------------------------------------------------------------------------
-- Optional FK users.startup_id -> startups (nullable)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_startup_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_startup_id_fkey
      FOREIGN KEY (startup_id) REFERENCES public.startups (id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.startup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Drop legacy startup select policy if present (replaced with owner + approved)
DROP POLICY IF EXISTS "Public read approved startups" ON public.startups;

CREATE POLICY "startups_select_approved_or_owned"
  ON public.startups
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved'
    OR founder_id = auth.uid()
  );

-- Founders may update their startup (admin continues to use service role)
DROP POLICY IF EXISTS "Founders update own startup" ON public.startups;
CREATE POLICY "Founders update own startup"
  ON public.startups
  FOR UPDATE
  TO authenticated
  USING (founder_id = auth.uid())
  WITH CHECK (founder_id = auth.uid());

-- Metrics: readable if startup visible to user
DROP POLICY IF EXISTS "startup_metrics_select" ON public.startup_metrics;
CREATE POLICY "startup_metrics_select"
  ON public.startup_metrics
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = startup_metrics.startup_id
        AND (s.status = 'approved' OR s.founder_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "startup_metrics_founder_write" ON public.startup_metrics;
CREATE POLICY "startup_metrics_founder_write"
  ON public.startup_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = startup_metrics.startup_id AND s.founder_id = auth.uid()
    )
  );

CREATE POLICY "startup_metrics_founder_update"
  ON public.startup_metrics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = startup_metrics.startup_id AND s.founder_id = auth.uid()
    )
  );

CREATE POLICY "startup_metrics_founder_delete"
  ON public.startup_metrics
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = startup_metrics.startup_id AND s.founder_id = auth.uid()
    )
  );

-- Investments: own rows only
DROP POLICY IF EXISTS "investments_select_own" ON public.investments;
CREATE POLICY "investments_select_own"
  ON public.investments
  FOR SELECT
  TO authenticated
  USING (investor_id = auth.uid());

DROP POLICY IF EXISTS "investments_insert_own" ON public.investments;
CREATE POLICY "investments_insert_own"
  ON public.investments
  FOR INSERT
  TO authenticated
  WITH CHECK (investor_id = auth.uid());

-- Users: read own profile
DROP POLICY IF EXISTS "users_select_self" ON public.users;
CREATE POLICY "users_select_self"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_self" ON public.users;
CREATE POLICY "users_update_self"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Public founder cards on startup profiles (approved listings only)
DROP POLICY IF EXISTS "users_public_read_founders" ON public.users;
CREATE POLICY "users_public_read_founders"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.founder_id = users.id AND s.status = 'approved'
    )
  );

-- Pitch submissions: keep public read for approved-chain; add founder read/write via startup
DROP POLICY IF EXISTS "Public read pitches for approved startups" ON public.pitch_submissions;

CREATE POLICY "pitch_select_visible"
  ON public.pitch_submissions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = pitch_submissions.startup_id
        AND (
          s.status = 'approved'
          OR s.founder_id = auth.uid()
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('startup-assets', 'startup-assets', true),
  ('pitch-decks', 'pitch-decks', false),
  ('founder-videos', 'founder-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Public read for startup-assets (logos / banners)
DROP POLICY IF EXISTS "startup_assets_public_read" ON storage.objects;
CREATE POLICY "startup_assets_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'startup-assets');

-- Authenticated upload into startup-assets under folder named startup id where user is founder
DROP POLICY IF EXISTS "startup_assets_founder_upload" ON storage.objects;
CREATE POLICY "startup_assets_founder_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'startup-assets'
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id::text = (storage.foldername(name))[1]
        AND s.founder_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pitch_decks_founder_all" ON storage.objects;
CREATE POLICY "pitch_decks_founder_all"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'pitch-decks'
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id::text = (storage.foldername(name))[1]
        AND s.founder_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'pitch-decks'
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id::text = (storage.foldername(name))[1]
        AND s.founder_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "founder_videos_founder_all" ON storage.objects;
CREATE POLICY "founder_videos_founder_all"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'founder-videos'
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id::text = (storage.foldername(name))[1]
        AND s.founder_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'founder-videos'
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id::text = (storage.foldername(name))[1]
        AND s.founder_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime (requires replica identity FULL for reliable UPDATE payloads)
-- ---------------------------------------------------------------------------
ALTER TABLE public.startups REPLICA IDENTITY FULL;
ALTER TABLE public.startup_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.pitch_submissions REPLICA IDENTITY FULL;

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.startups;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pitch_submissions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
