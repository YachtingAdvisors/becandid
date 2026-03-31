'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { GoalCategory, Severity } from '@be-candid/shared';

export interface RealtimeEvent {
  id: string;
  category: GoalCategory;
  severity: Severity;
  platform: string;
  app_name?: string;
  duration_seconds?: number;
  timestamp: string;
}

interface UseRealtimeEventsResult {
  events: RealtimeEvent[];
  connected: boolean;
  lastEventAt: string | null;
}

export function useRealtimeEvents(userId: string): UseRealtimeEventsResult {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Fetch initial events
    fetch('/api/events?limit=50')
      .then((r) => r.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          if (data.events.length > 0) {
            setLastEventAt(data.events[0].timestamp);
          }
        }
      })
      .catch(() => {});

    // Subscribe to real-time inserts
    const channel = supabase
      .channel(`events-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newEvent = payload.new as RealtimeEvent;
          setEvents((prev) => [newEvent, ...prev].slice(0, 50));
          setLastEventAt(newEvent.timestamp);
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    // Timeout: if not connected after 5 seconds, mark as connected anyway
    // so the empty state renders instead of the spinner
    const timeout = setTimeout(() => {
      setConnected((prev) => prev || true);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { events, connected, lastEventAt };
}
