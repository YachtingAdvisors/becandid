-- ─── Enable Supabase Realtime on events table ─────────────────
-- Required for the real-time activity dashboard to receive live updates.

ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- RLS SELECT policy (required for Realtime to deliver rows to subscribed clients)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can see own events via realtime'
  ) THEN
    CREATE POLICY "Users can see own events via realtime"
      ON public.events FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
