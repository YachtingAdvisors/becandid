// ============================================================
// mobile/src/lib/push/setup.ts
//
// Push notification registration for Expo. Handles:
//   1. Requesting notification permissions
//   2. Getting the Expo push token
//   3. Registering the token with the web API
//   4. Mapping notification data to screen routes
// ============================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getSession } from '../supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

// ── Request permissions + get token ─────────────────────────

export async function setupPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Push] Skipping — not a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  // Request if not already granted
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission denied');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });
  }

  // Get Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const token = tokenData.data;

  console.log('[Push] Token:', token);

  // Register with the web API
  await registerTokenWithAPI(token);

  return token;
}

// ── Register token with server ──────────────────────────────

async function registerTokenWithAPI(token: string): Promise<void> {
  try {
    const session = await getSession();
    if (!session?.access_token) {
      console.log('[Push] No session — skipping token registration');
      return;
    }

    const res = await fetch(`${API_URL}/api/auth/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        push_token: token,
        platform: Platform.OS,
        device_name: Device.deviceName || undefined,
      }),
    });

    if (!res.ok) {
      console.error('[Push] Token registration failed:', res.status);
    } else {
      console.log('[Push] Token registered with server');
    }
  } catch (e) {
    console.error('[Push] Token registration error:', e);
  }
}

// ── Map notification data to app screen ─────────────────────

export function getScreenFromNotification(
  data: Record<string, any>
): { screen: string; params?: Record<string, any> } | null {
  const type = data.type as string;

  switch (type) {
    case 'journal_reminder':
    case 'relapse_journal':
      return {
        screen: '/(tabs)/journal',
        params: {
          action: 'write',
          trigger: type === 'relapse_journal' ? 'relapse' : 'reminder',
        },
      };

    case 'alert_to_user':
    case 'alert_to_partner':
      return data.alert_id
        ? { screen: `/conversation/${data.alert_id}` }
        : null;

    case 'check_in':
      return data.check_in_id
        ? { screen: `/checkin/${data.check_in_id}` }
        : null;

    case 'security_alert':
    case 'partner_fatigue':
      return { screen: '/(tabs)/settings' };

    default:
      return data.url ? { screen: data.url } : null;
  }
}
