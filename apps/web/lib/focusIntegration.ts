// ============================================================
// Be Candid — Focus Segment Integration
//
// Drop-in function to call from the alert pipeline (alertPipeline.ts)
// after an event is logged. Marks the current segment distracted
// and awards conversation-completed points when applicable.
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { markSegmentDistracted } from './focusSegments';

/**
 * Call this from alertPipeline.ts right after inserting the event.
 *
 * Usage in alertPipeline.ts:
 *   import { onEventFlagged } from '../lib/focusIntegration';
 *   ...
 *   await onEventFlagged(db, userId, event.timestamp, event.category);
 */
export async function onEventFlagged(
  db: SupabaseClient,
  userId: string,
  eventTimestamp: string,
  category: string
): Promise<void> {
  // Get user timezone
  const { data: user } = await db
    .from('users')
    .select('timezone')
    .eq('id', userId)
    .single();

  const tz = user?.timezone || 'America/New_York';

  await markSegmentDistracted(db, userId, eventTimestamp, category, tz);
}

/**
 * Call this when a conversation is marked complete.
 * Awards trust points for completing and for positive outcome.
 *
 * Usage in conversation completion handler:
 *   import { onConversationCompleted } from '../lib/focusIntegration';
 *   ...
 *   await onConversationCompleted(db, userId, alertId, outcome);
 */
export async function onConversationCompleted(
  db: SupabaseClient,
  userId: string,
  alertId: string,
  outcome: 'positive' | 'neutral' | 'difficult'
): Promise<string[]> {
  const pointsToInsert: Array<{
    user_id: string;
    points: number;
    action: string;
    reference_id: string;
    note: string;
  }> = [];

  // Always award conversation completion
  pointsToInsert.push({
    user_id: userId,
    points: 25,
    action: 'conversation_done',
    reference_id: alertId,
    note: 'Completed an accountability conversation',
  });

  // Bonus for positive outcome
  if (outcome === 'positive') {
    pointsToInsert.push({
      user_id: userId,
      points: 10,
      action: 'conversation_positive',
      reference_id: alertId,
      note: 'Conversation had a positive outcome',
    });
  }

  // Also award points to the partner
  const { data: alert } = await db
    .from('alerts')
    .select('user_id')
    .eq('id', alertId)
    .single();

  if (alert) {
    const { data: partner } = await db
      .from('partners')
      .select('partner_user_id')
      .eq('user_id', alert.user_id)
      .eq('status', 'active')
      .maybeSingle();

    if (partner?.partner_user_id) {
      pointsToInsert.push({
        user_id: partner.partner_user_id,
        points: 5,
        action: 'partner_encouraged',
        reference_id: alertId,
        note: 'Partner completed an accountability conversation',
      });
    }
  }

  // Batch insert
  await db.from('trust_points').insert(pointsToInsert);

  // Check conversation milestones
  const { count } = await db
    .from('trust_points')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', 'conversation_done');

  const convoCount = count || 0;
  const milestoneMap: Record<number, string> = {
    5: 'conversations_5',
    10: 'conversations_10',
    25: 'conversations_25',
  };

  const unlocked: string[] = [];
  for (const [threshold, milestone] of Object.entries(milestoneMap)) {
    if (convoCount >= parseInt(threshold)) {
      const { data: existing } = await db
        .from('milestones')
        .select('id')
        .eq('user_id', userId)
        .eq('milestone', milestone)
        .maybeSingle();

      if (!existing) {
        await db.from('milestones').insert({ user_id: userId, milestone });
        await db.from('trust_points').insert({
          user_id: userId,
          points: 50,
          action: 'milestone_reached',
          note: `Unlocked: ${milestone}`,
        });
        unlocked.push(milestone);
      }
    }
  }

  return unlocked;
}
