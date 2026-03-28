// ============================================================
// apps/mobile/app/_layout.tsx — REWRITE
//
// Root layout for the Expo mobile app. Handles:
//   1. Auth state management
//   2. Push notification setup + deep link routing
//   3. Offline event queue listener
//   4. Platform-specific monitoring registration
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { setupPushNotifications, getScreenFromNotification } from '../src/lib/push/setup';
import { startOfflineQueueListener, syncPendingEvents } from '../src/lib/offlineQueue';
import { supabase } from '../src/lib/supabase';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    let offlineCleanup: (() => void) | undefined;

    async function init() {
      // 1. Check auth state
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsReady(true);
        return;
      }

      // 2. Push notifications
      await setupPushNotifications().catch(console.error);

      // 3. Offline queue — start listener + sync any pending
      offlineCleanup = startOfflineQueueListener();
      await syncPendingEvents().catch(console.error);

      // 4. Platform monitoring
      if (Platform.OS === 'android') {
        const { registerMonitoringTask } = await import('../src/lib/monitor.android');
        await registerMonitoringTask().catch(console.error);
      } else if (Platform.OS === 'ios') {
        const { registerMonitoringTask } = await import('../src/lib/monitor.ios');
        await registerMonitoringTask().catch(console.error);
      }

      setIsReady(true);
    }

    init();

    // Listen for foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Push] Foreground:', notification.request.content.title);
      }
    );

    // Listen for notification taps → deep link
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (!data) return;

        const url = data.url as string;
        const type = data.type as string;

        // Handle journal deep links from push notifications
        if (type === 'journal_reminder' || type === 'relapse_journal') {
          // These have a URL like /dashboard/stringer-journal?action=write&trigger=...
          // On mobile, route to the journal tab
          router.push('/(tabs)/journal');
          return;
        }

        // Handle other deep links
        if (type === 'alert_to_user' && data.alert_id) {
          router.push(`/conversation/${data.alert_id}`);
          return;
        }

        if (type === 'alert_to_partner' && data.alert_id) {
          router.push(`/conversation/${data.alert_id}`);
          return;
        }

        if (type === 'check_in' && data.check_in_id) {
          router.push(`/checkin/${data.check_in_id}`);
          return;
        }

        if (type === 'security_alert') {
          router.push('/(tabs)/settings');
          return;
        }

        if (type === 'partner_fatigue') {
          router.push('/(tabs)/settings');
          return;
        }
      }
    );

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/auth/signin');
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.unsubscribe();
      offlineCleanup?.();
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="conversation/[alertId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkin/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
