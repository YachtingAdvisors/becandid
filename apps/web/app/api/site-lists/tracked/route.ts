export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';

// Category severity ordering (most questionable first)
const CATEGORY_ORDER: Record<string, number> = {
  pornography: 0, sexting: 1, gambling: 2, sports_betting: 3,
  day_trading: 4, dating_apps: 5, alcohol_drugs: 6, vaping_tobacco: 7,
  eating_disorder: 8, body_checking: 9, rage_content: 10,
  gaming: 11, impulse_shopping: 12, binge_watching: 13,
  social_media: 14, custom: 15,
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = supabase;

    // Get unique domains from events with category and count
    const { data: events } = await db
      .from('events')
      .select('app_name, category, timestamp')
      .eq('user_id', user.id)
      .not('app_name', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(5000);

    if (!events || events.length === 0) {
      return NextResponse.json({ tracked: [] });
    }

    // Aggregate by domain
    const domainMap = new Map<string, { domain: string; category: string; count: number; last_visit: string }>();
    for (const e of events) {
      const domain = e.app_name?.toLowerCase().trim();
      if (!domain) continue;
      const existing = domainMap.get(domain);
      if (existing) {
        existing.count++;
        // Keep the most severe category
        if ((CATEGORY_ORDER[e.category] ?? 99) < (CATEGORY_ORDER[existing.category] ?? 99)) {
          existing.category = e.category;
        }
      } else {
        domainMap.set(domain, {
          domain,
          category: e.category ?? 'custom',
          count: 1,
          last_visit: e.timestamp,
        });
      }
    }

    // Sort: most questionable category first, then by count descending
    const tracked = Array.from(domainMap.values()).sort((a, b) => {
      const catDiff = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
      if (catDiff !== 0) return catDiff;
      return b.count - a.count;
    });

    // Get existing site list entries to mark which are already categorized
    const { data: existingSites } = await db
      .from('site_lists')
      .select('domain, list_type')
      .eq('user_id', user.id);

    const siteMap = new Map((existingSites ?? []).map(s => [s.domain, s.list_type]));

    const result = tracked.map(t => ({
      ...t,
      list_type: siteMap.get(t.domain) ?? null, // null = uncategorized
    }));

    return NextResponse.json({ tracked: result });
  } catch (err) {
    return safeError('GET /api/site-lists/tracked', err);
  }
}
