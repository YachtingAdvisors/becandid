// ============================================================
// apps/mobile/app/_layout.tsx — REWRITE
//
// Root layout for the Expo mobile app. Handles:
//   1. Auth state management
//   2. Push notification setup + deep link routing
//   3. Offline event queue listener
//   4. Platform-specific monitoring registration
//   5. Theme provider (dark mode)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { startHeartbeat, stopHeartbeat } from '../src/lib/heartbeat';
import { setupPushNotifications, getScreenFromNotification } from '../src/lib/push/setup';
import { startOfflineQueueListener, syncPendingEvents } from '../src/lib/offlineQueue';
import { supabase } from '../src/lib/supabase';
import { updateCachedBlocklist } from '../src/lib/contentFilter.client';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function InnerLayout() {
  const { isDark, colors } = useTheme();
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

      // 2. Start heartbeat (pings server every 2 min)
      startHeartbeat();

      // 3. Push notifications
      await setupPushNotifications().catch(console.error);

      // 3. Offline queue — start listener + sync any pending
      offlineCleanup = startOfflineQueueListener();
      await syncPendingEvents().catch(console.error);

      // 4. Platform monitoring (legacy stub)
      if (Platform.OS === 'android') {
        const { registerMonitoringTask } = await import('../src/lib/monitor.android');
        await registerMonitoringTask().catch(console.error);
      } else if (Platform.OS === 'ios') {
        const { registerMonitoringTask } = await import('../src/lib/monitor.ios');
        await registerMonitoringTask().catch(console.error);
      }

      // 5. Content filter — fetch user's custom rules and seed local cache
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.access_token) {
          const rulesRes = await fetch(`${apiUrl}/api/content-filter/rules`, {
            headers: { Authorization: `Bearer ${currentSession.access_token}` },
          });
          if (rulesRes.ok) {
            const { rules } = await rulesRes.json();
            if (Array.isArray(rules)) {
              await updateCachedBlocklist(rules);
            }
          }
        }
      } catch (e) {
        // Non-fatal — app works fine with the bundled default blocklist
        console.warn('[Layout] Content filter init failed (using defaults):', e);
      }

      // 6. Start platform-appropriate monitoring if user has it enabled
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('monitoring_enabled')
          .eq('id', session.user.id)
          .single();

        const monitoringEnabled = profile?.monitoring_enabled === true;

        if (monitoringEnabled) {
          const apiBase = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';
          if (Platform.OS === 'android') {
            const { startAndroidMonitoring } = await import('../src/lib/monitor.android');
            startAndroidMonitoring({ userId: session.user.id, apiBase });
          } else if (Platform.OS === 'ios') {
            const { startIOSMonitoring } = await import('../src/lib/monitor.ios');
            startIOSMonitoring({ userId: session.user.id, apiBase });
          }
        }
      } catch (e) {
        console.warn('[Layout] Monitoring init failed:', e);
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
      stopHeartbeat();
      // Stop platform monitoring on unmount
      if (Platform.OS === 'android') {
        import('../src/lib/monitor.android').then(({ stopAndroidMonitoring }) => {
          stopAndroidMonitoring();
        }).catch(() => {});
      } else if (Platform.OS === 'ios') {
        import('../src/lib/monitor.ios').then(({ stopIOSMonitoring }) => {
          stopIOSMonitoring();
        }).catch(() => {});
      }
    };
  }, []);

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="conversation/[alertId]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="checkin/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="coach" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="mood-calendar" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="progress" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="fasting" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="referrals" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reflections" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InnerLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
