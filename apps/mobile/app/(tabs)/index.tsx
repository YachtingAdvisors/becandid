// ============================================================
// app/(tabs)/index.tsx — Dashboard Screen
//
// Main dashboard with monitoring status, mood check-in,
// growth stats, partner status, recent alerts, and quick actions.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase, getSession } from '../../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

// Brand colors
const C = {
  primary: '#226779',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  emerald: '#10b981',
  border: '#e5e7eb',
} as const;

const MOODS = [
  { label: 'Great', emoji: '\u{1F60A}', severity: 1 },
  { label: 'Good', emoji: '\u{1F642}', severity: 2 },
  { label: 'Okay', emoji: '\u{1F610}', severity: 3 },
  { label: 'Struggling', emoji: '\u{1F61F}', severity: 7 },
  { label: 'Crisis', emoji: '\u{1F198}', severity: 10 },
] as const;

type Profile = {
  display_name?: string;
  email?: string;
  partner_name?: string;
  partner_status?: string;
};

type Stats = {
  focusRate?: number;
  streakDays?: number;
  trustPoints?: number;
  milestones?: number;
};

type AlertItem = {
  id: string;
  category: string;
  severity: number;
  created_at: string;
  metadata?: Record<string, any>;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [awarenessActive, setAwarenessActive] = useState(false);
  const [stats, setStats] = useState<Stats>({});
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Fetch profile
      const profileRes = await fetch(`${API_URL}/api/auth/profile`, { headers });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
      }

      // Fetch heartbeat / awareness status
      const heartbeatRes = await fetch(`${API_URL}/api/heartbeat`, { headers });
      if (heartbeatRes.ok) {
        const hb = await heartbeatRes.json();
        setAwarenessActive(hb.active === true || hb.status === 'active');
      }

      // Fetch trust point stats
      const statsRes = await fetch(`${API_URL}/api/trust-points/stats`, { headers });
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats({
          focusRate: s.focusRate ?? s.focus_rate ?? 0,
          streakDays: s.streakDays ?? s.streak_days ?? 0,
          trustPoints: s.trustPoints ?? s.trust_points ?? 0,
          milestones: s.milestones ?? s.milestones_count ?? 0,
        });
      }

      // Fetch recent alerts (high severity events)
      try {
        const alertsRes = await fetch(`${API_URL}/api/events?limit=5&min_severity=6`, { headers });
        if (alertsRes.ok) {
          const alertData = await alertsRes.json();
          setRecentAlerts(Array.isArray(alertData) ? alertData.slice(0, 3) : (alertData.events ?? []).slice(0, 3));
        }
      } catch {
        // alerts are non-critical
      }
    } catch (e) {
      console.warn('[Dashboard] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleMoodPress = useCallback(
    async (mood: (typeof MOODS)[number], index: number) => {
      setSelectedMood(index);

      // Crisis mode
      if (mood.severity === 10) {
        Alert.alert(
          'You Are Not Alone',
          'If you are in crisis, please reach out:\n\n988 Suicide & Crisis Lifeline\nCall or text 988\n\nCrisis Text Line\nText HOME to 741741',
          [{ text: 'I Understand', style: 'default' }]
        );
      }

      try {
        const session = await getSession();
        if (!session) return;

        await fetch(`${API_URL}/api/events`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: 'custom',
            severity: mood.severity,
            platform: 'ios',
            metadata: { type: 'mood_checkin', mood: mood.label },
          }),
        });
      } catch (e) {
        console.warn('[Dashboard] Mood POST error:', e);
      }

      // Reset selection after a moment
      setTimeout(() => setSelectedMood(null), 2000);
    },
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#226779" />
      </SafeAreaView>
    );
  }

  const getAlertTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>{profile?.display_name || 'Friend'}</Text>
          </View>
          <Pressable
            style={styles.headerSettingsBtn}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={C.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Monitoring Status Indicator */}
        <View style={styles.monitoringBar}>
          <View style={styles.monitoringLeft}>
            <View
              style={[
                styles.monitoringDot,
                { backgroundColor: awarenessActive ? C.emerald : C.error },
              ]}
            />
            <View>
              <Text style={styles.monitoringTitle}>Monitoring Status</Text>
              <Text style={styles.monitoringSubtext}>
                {awarenessActive ? 'Active - your partner can see your activity' : 'Inactive - monitoring is turned off'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.monitoringBadge,
              { backgroundColor: awarenessActive ? '#dcfce7' : '#fee2e2' },
            ]}
          >
            <Text
              style={[
                styles.monitoringBadgeText,
                { color: awarenessActive ? '#16a34a' : '#dc2626' },
              ]}
            >
              {awarenessActive ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>

        {/* Mood Check-in */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you doing?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood, i) => (
              <Pressable
                key={mood.label}
                style={[
                  styles.moodButton,
                  selectedMood === i && styles.moodButtonSelected,
                ]}
                onPress={() => handleMoodPress(mood, i)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === i && styles.moodLabelSelected,
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Growth Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Growth</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={20} color={C.primary} />
              <Text style={styles.statValue}>{stats.trustPoints ?? 0}</Text>
              <Text style={styles.statLabel}>Trust Points</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame-outline" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>{stats.streakDays ?? 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="eye-outline" size={20} color={C.emerald} />
              <Text style={styles.statValue}>{stats.focusRate ?? 0}%</Text>
              <Text style={styles.statLabel}>Focus Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flag-outline" size={20} color="#8b5cf6" />
              <Text style={styles.statValue}>{stats.milestones ?? 0}</Text>
              <Text style={styles.statLabel}>Milestones</Text>
            </View>
          </View>
        </View>

        {/* Partner Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Partner</Text>
          {profile?.partner_name ? (
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Ionicons name="person" size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>{profile.partner_name}</Text>
                <Text style={styles.partnerStatus}>
                  {profile.partner_status === 'active' ? 'Connected' : 'Pending'}
                </Text>
              </View>
              <View
                style={[
                  styles.partnerDotBadge,
                  {
                    backgroundColor:
                      profile.partner_status === 'active' ? '#dcfce7' : '#fef3c7',
                  },
                ]}
              >
                <View
                  style={[
                    styles.partnerDot,
                    {
                      backgroundColor:
                        profile.partner_status === 'active' ? '#16a34a' : '#ca8a04',
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.invitePartnerBtn}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="person-add-outline" size={18} color={C.primary} />
              <Text style={styles.invitePartnerText}>Invite a Partner</Text>
              <Ionicons name="chevron-forward" size={16} color={C.onSurfaceVariant} />
            </Pressable>
          )}
        </View>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Recent Alerts</Text>
              <Pressable onPress={() => router.push('/(tabs)/activity')}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            {recentAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertRow}>
                <View style={styles.alertDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertCategory}>{alert.category.replace(/_/g, ' ')}</Text>
                  <Text style={styles.alertTime}>{getAlertTimeAgo(alert.created_at)}</Text>
                </View>
                <View style={[styles.alertSeverity, { backgroundColor: alert.severity >= 7 ? '#fee2e2' : '#fef3c7' }]}>
                  <Text style={[styles.alertSeverityText, { color: alert.severity >= 7 ? '#dc2626' : '#ca8a04' }]}>
                    {alert.severity >= 7 ? 'High' : 'Medium'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButton} onPress={() => {}}>
              <View style={[styles.actionIcon, { backgroundColor: '#ede9fe' }]}>
                <Ionicons name="call-outline" size={20} color="#7c3aed" />
              </View>
              <Text style={styles.actionLabel}>Reach Out</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/journal')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#e0f2f1' }]}>
                <Ionicons name="create-outline" size={20} color={C.primary} />
              </View>
              <Text style={styles.actionLabel}>Journal</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="bar-chart-outline" size={20} color="#ca8a04" />
              </View>
              <Text style={styles.actionLabel}>Activity</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSettingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  welcomeText: {
    fontSize: 14,
    color: C.onSurfaceVariant,
  },
  nameText: {
    fontSize: 26,
    fontWeight: '700',
    color: C.onSurface,
    marginTop: 2,
  },
  // Monitoring status bar
  monitoringBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  monitoringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  monitoringDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  monitoringTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
  },
  monitoringSubtext: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  monitoringBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  monitoringBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 60,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: '#e0f2f1',
    borderColor: C.primary,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: C.primary,
    fontWeight: '600',
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
  },
  statLabel: {
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  // Partner
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.onSurface,
  },
  partnerStatus: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  partnerDotBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  invitePartnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invitePartnerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
  },
  // Alerts
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.error,
  },
  alertCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurface,
    textTransform: 'capitalize',
  },
  alertTime: {
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  alertSeverity: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alertSeverityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.onSurface,
    textAlign: 'center',
  },
});
