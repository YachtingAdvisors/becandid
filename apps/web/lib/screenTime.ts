// ============================================================
// Be Candid — Screen Time Management
//
// Records usage, checks limits, and enforces downtime rules.
// ============================================================

import { createServiceClient } from './supabase';
import type { ScreenTimeRule, ScreenTimeUsage } from '@be-candid/shared';

// ── Record screen time usage ───────────────────────────────
export async function recordUsage(
  userId: string,
  category: string,
  minutes: number,
  date?: string
): Promise<void> {
  const db = createServiceClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Upsert: increment minutes if row exists for this user/date/category
  const { data: existing } = await db
    .from('screen_time_usage')
    .select('id, minutes_used')
    .eq('user_id', userId)
    .eq('date', targetDate)
    .eq('category', category)
    .single();

  if (existing) {
    await db
      .from('screen_time_usage')
      .update({ minutes_used: existing.minutes_used + minutes })
      .eq('id', existing.id);
  } else {
    await db.from('screen_time_usage').insert({
      user_id: userId,
      date: targetDate,
      category,
      minutes_used: minutes,
    });
  }
}

// ── Get usage for a date range ─────────────────────────────
export async function getUsage(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ScreenTimeUsage[]> {
  const db = createServiceClient();
  const { data: usageRows } = await db
    .from('screen_time_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  // Attach limit info from rules
  const { data: rules } = await db
    .from('screen_time_rules')
    .select('category, daily_limit_minutes')
    .eq('user_id', userId);

  const limitMap = new Map<string, number | null>();
  for (const rule of rules || []) {
    limitMap.set(rule.category, rule.daily_limit_minutes);
  }

  return (usageRows || []).map((row: any) => {
    const limit = limitMap.get(row.category) ?? limitMap.get('all') ?? null;
    return {
      user_id: row.user_id,
      date: row.date,
      category: row.category,
      minutes_used: row.minutes_used,
      limit_minutes: limit,
      over_limit: limit !== null && row.minutes_used > limit,
    };
  });
}

// ── Get today's usage summary ──────────────────────────────
export async function getTodayUsage(
  userId: string
): Promise<{ category: string; minutes: number; limit: number | null }[]> {
  const today = new Date().toISOString().split('T')[0];
  const db = createServiceClient();

  const { data: usageRows } = await db
    .from('screen_time_usage')
    .select('category, minutes_used')
    .eq('user_id', userId)
    .eq('date', today);

  const { data: rules } = await db
    .from('screen_time_rules')
    .select('category, daily_limit_minutes')
    .eq('user_id', userId);

  const limitMap = new Map<string, number | null>();
  for (const rule of rules || []) {
    limitMap.set(rule.category, rule.daily_limit_minutes);
  }

  return (usageRows || []).map((row: any) => ({
    category: row.category,
    minutes: row.minutes_used,
    limit: limitMap.get(row.category) ?? limitMap.get('all') ?? null,
  }));
}

// ── Check if user is over limit for a category ─────────────
export async function isOverLimit(
  userId: string,
  category: string
): Promise<{ over: boolean; used: number; limit: number }> {
  const today = new Date().toISOString().split('T')[0];
  const db = createServiceClient();

  const { data: usage } = await db
    .from('screen_time_usage')
    .select('minutes_used')
    .eq('user_id', userId)
    .eq('date', today)
    .eq('category', category)
    .single();

  const { data: rule } = await db
    .from('screen_time_rules')
    .select('daily_limit_minutes')
    .eq('user_id', userId)
    .eq('category', category)
    .single();

  // Fall back to 'all' category rule if no specific one exists
  let limitMinutes = rule?.daily_limit_minutes ?? null;
  if (limitMinutes === null) {
    const { data: allRule } = await db
      .from('screen_time_rules')
      .select('daily_limit_minutes')
      .eq('user_id', userId)
      .eq('category', 'all')
      .single();
    limitMinutes = allRule?.daily_limit_minutes ?? 0;
  }

  const used = usage?.minutes_used ?? 0;
  return {
    over: limitMinutes > 0 && used > limitMinutes,
    used,
    limit: limitMinutes ?? 0,
  };
}

// ── Check if currently in downtime ─────────────────────────
export async function isInDowntime(
  userId: string
): Promise<{ inDowntime: boolean; endsAt: string | null }> {
  const db = createServiceClient();
  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  const { data: rules } = await db
    .from('screen_time_rules')
    .select('downtime_start, downtime_end, days_of_week')
    .eq('user_id', userId)
    .not('downtime_start', 'is', null)
    .not('downtime_end', 'is', null);

  if (!rules || rules.length === 0) {
    return { inDowntime: false, endsAt: null };
  }

  for (const rule of rules) {
    const days: number[] = rule.days_of_week || [0, 1, 2, 3, 4, 5, 6];
    if (!days.includes(currentDay)) continue;

    const start = rule.downtime_start as string;
    const end = rule.downtime_end as string;

    // Handle overnight downtime (e.g., 22:00 - 06:00)
    if (start > end) {
      if (currentTime >= start || currentTime < end) {
        return { inDowntime: true, endsAt: end };
      }
    } else {
      if (currentTime >= start && currentTime < end) {
        return { inDowntime: true, endsAt: end };
      }
    }
  }

  return { inDowntime: false, endsAt: null };
}

// ── Get screen time rules for user ─────────────────────────
export async function getScreenTimeRules(
  userId: string
): Promise<ScreenTimeRule[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('screen_time_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch screen time rules:', error);
    return [];
  }
  return (data as ScreenTimeRule[]) || [];
}
