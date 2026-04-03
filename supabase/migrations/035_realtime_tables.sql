-- ─── Enable Supabase Realtime on additional tables ─────────────
-- Extends 023_realtime_events.sql to support live dashboard updates
-- for alerts, check-ins, nudges, milestones, and focus segments.

ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE nudges;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_segments;

-- RLS SELECT policies (required for Realtime to deliver rows to subscribed clients)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can see own alerts via realtime'
  ) THEN
    CREATE POLICY "Users can see own alerts via realtime"
      ON public.alerts FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'check_ins' AND policyname = 'Users can see own check_ins via realtime'
  ) THEN
    CREATE POLICY "Users can see own check_ins via realtime"
      ON public.check_ins FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() = partner_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nudges' AND policyname = 'Users can see own nudges via realtime'
  ) THEN
    CREATE POLICY "Users can see own nudges via realtime"
      ON public.nudges FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'milestones' AND policyname = 'Users can see own milestones via realtime'
  ) THEN
    CREATE POLICY "Users can see own milestones via realtime"
      ON public.milestones FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'focus_segments' AND policyname = 'Users can see own focus_segments via realtime'
  ) THEN
    CREATE POLICY "Users can see own focus_segments via realtime"
      ON public.focus_segments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
