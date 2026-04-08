-- SEO content generation tracking table
CREATE TABLE IF NOT EXISTS public.seo_content (
  slug TEXT PRIMARY KEY,
  track TEXT NOT NULL CHECK (track IN ('A', 'B')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_seo_content_status ON public.seo_content (status);
CREATE INDEX IF NOT EXISTS idx_seo_content_track ON public.seo_content (track);

COMMENT ON TABLE public.seo_content IS 'Tracks AI-generated SEO blog posts. Track A = competitor spokes (auto-publish), Track B = pillar guides (human review required).';
