-- Founder profile + market size support + realtime coverage.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text;

CREATE TABLE IF NOT EXISTS public.startup_market_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL UNIQUE REFERENCES public.startups (id) ON DELETE CASCADE,
  tam numeric NOT NULL,
  sam numeric NOT NULL,
  som numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS startup_market_sizes_startup_idx
  ON public.startup_market_sizes (startup_id);

ALTER TABLE public.startup_market_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "startup_market_sizes_select" ON public.startup_market_sizes;
CREATE POLICY "startup_market_sizes_select"
  ON public.startup_market_sizes
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.startups s
      WHERE s.id = startup_market_sizes.startup_id
        AND (s.status = 'approved' OR s.founder_id = auth.uid())
    )
  );

-- Realtime publication coverage for dashboards and profile charts.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.startup_metrics;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.startup_market_sizes;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
