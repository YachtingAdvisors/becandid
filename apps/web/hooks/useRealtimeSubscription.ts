// ============================================================
// useRealtimeSubscription — Subscribe to Supabase Realtime changes
//
// Listens for INSERT events on: alerts, check_ins, nudges,
// milestones, focus_segments (filtered by user_id).
// Returns accumulated events and connection status.
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEvent {
  type: 'alert' | 'check_in' | 'nudge' | 'focus_segment' | 'milestone';
  payload: Record<string, any>;
  timestamp: string;
}

// Map DB table names to our event types
const TABLE_EVENT_MAP: Record<string, RealtimeEvent['type']> = {
  alerts: 'alert',
  check_ins: 'check_in',
  nudges: 'nudge',
  milestones: 'milestone',
  focus_segments: 'focus_segment',
};

const SUBSCRIBED_TABLES = Object.keys(TABLE_EVENT_MAP);
const MAX_EVENTS = 100; // cap to avoid unbounded memory growth

/**
 * Subscribe to real-time inserts for the given user across
 * alerts, check_ins, nudges, milestones, and focus_segments.
 */
export function useRealtimeAlerts(userId: string): {
  events: RealtimeEvent[];
  isConnected: boolean;
  clearEvents: () => void;
} {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  const clearEvents = useCallback(() => setEvents([]), []);

  useEffect(() => {
    if (!userId) return;

    const supabase = supabaseRef.current;

    // Build a single channel with multiple postgres_changes listeners
    let channel = supabase.channel(`realtime:${userId}`, {
      config: { broadcast: { self: true } },
    });

    for (const table of SUBSCRIBED_TABLES) {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const eventType = TABLE_EVENT_MAP[table];
          if (!eventType) return;

          const newEvent: RealtimeEvent = {
            type: eventType,
            payload: payload.new ?? payload,
            timestamp: new Date().toISOString(),
          };

          setEvents((prev) => {
            const next = [newEvent, ...prev];
            return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
          });
        },
      );
    }

    // Also listen for check_ins where user is the partner
    channel = channel.on(
      'postgres_changes' as any,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'check_ins',
        filter: `partner_user_id=eq.${userId}`,
      },
      (payload: any) => {
        const newEvent: RealtimeEvent = {
          type: 'check_in',
          payload: payload.new ?? payload,
          timestamp: new Date().toISOString(),
        };
        setEvents((prev) => {
          const next = [newEvent, ...prev];
          return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
      },
    );

    channel.subscribe((status: string) => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId]);

  return { events, isConnected, clearEvents };
}
