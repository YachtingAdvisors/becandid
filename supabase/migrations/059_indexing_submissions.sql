-- Track Google Indexing API submissions to avoid duplicate requests
CREATE TABLE IF NOT EXISTS public.indexing_submissions (
  url TEXT PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'submitted'
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_indexing_submissions_date ON public.indexing_submissions (submitted_at);

COMMENT ON TABLE public.indexing_submissions IS 'Tracks URLs submitted to Google Indexing API. Used by /api/cron/google-indexing to avoid re-submitting within 7 days.';
