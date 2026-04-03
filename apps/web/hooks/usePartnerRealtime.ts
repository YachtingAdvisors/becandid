// ============================================================
// usePartnerRealtime — Realtime subscription for the partner view
//
// Listens for new alerts, check-in changes, and focus segment
// updates for the user being monitored by this partner.
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PartnerRealtimeEvent {
  type: 'alert' | 'check_in' | 'focus_segment';
  payload: Record<string, any>;
  timestamp: string;
}

const MAX_EVENTS = 50;

/**
 * Subscribe to real-time updates for the user being monitored.
 * The partner passes in the monitored user's ID.
 */
export function usePartnerRealtime(monitoredUserId: string | null): {
  events: PartnerRealtimeEvent[];
  isConnected: boolean;
  clearEvents: () => void;
} {
  const [events, setEvents] = useState<PartnerRealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  const clearEvents = useCallback(() => setEvents([]), []);

  useEffect(() => {
    if (!monitoredUserId) return;

    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`partner-realtime:${monitoredUserId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${monitoredUserId}`,
        },
        (payload: any) => {
          pushEvent('alert', payload.new ?? payload);
        },
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'check_ins',
          filter: `user_id=eq.${monitoredUserId}`,
        },
        (payload: any) => {
          pushEvent('check_in', payload.new ?? payload);
        },
      )
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'check_ins',
          filter: `user_id=eq.${monitoredUserId}`,
        },
        (payload: any) => {
          // Also catch UPDATEs for status changes
          if (payload.eventType === 'UPDATE') {
            pushEvent('check_in', payload.new ?? payload);
          }
        },
      )
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'focus_segments',
          filter: `user_id=eq.${monitoredUserId}`,
        },
        (payload: any) => {
          pushEvent('focus_segment', payload.new ?? payload);
        },
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    function pushEvent(type: PartnerRealtimeEvent['type'], payload: Record<string, any>) {
      const newEvent: PartnerRealtimeEvent = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      setEvents((prev) => {
        const next = [newEvent, ...prev];
        return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
      });
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [monitoredUserId]);

  return { events, isConnected, clearEvents };
}
