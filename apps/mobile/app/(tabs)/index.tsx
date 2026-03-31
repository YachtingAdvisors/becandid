// ============================================================
// app/(tabs)/index.tsx — Dashboard Screen
//
// Main dashboard with mood check-in, awareness status,
// growth stats, and quick actions.
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
import { useRouter } from 'expo-router';
import { supabase, getSession } from '../../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

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
};

type Stats = {
  focusRate?: number;
  streakDays?: number;
  trustPoints?: number;
  milestones?: number;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [awarenessActive, setAwarenessActive] = useState(false);
  const [stats, setStats] = useState<Stats>({});
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#226779" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.nameText}>{profile?.display_name || 'Friend'}</Text>
        </View>

        {/* Awareness Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Awareness Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: awarenessActive ? '#dcfce7' : '#fee2e2' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: awarenessActive ? '#16a34a' : '#dc2626' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: awarenessActive ? '#16a34a' : '#dc2626' },
              ]}
            >
              {awarenessActive ? 'Active' : 'Inactive'}
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
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Growth Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Growth Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.focusRate ?? 0}%</Text>
              <Text style={styles.statLabel}>Focus Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.streakDays ?? 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.trustPoints ?? 0}</Text>
              <Text style={styles.statLabel}>Trust Pts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.milestones ?? 0}</Text>
              <Text style={styles.statLabel}>Milestones</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButton} onPress={() => {}}>
              <Text style={styles.actionEmoji}>{'\u{1F91D}'}</Text>
              <Text style={styles.actionLabel}>Reach Out</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/journal')}
            >
              <Text style={styles.actionEmoji}>{'\u{1F4DD}'}</Text>
              <Text style={styles.actionLabel}>Write in Journal</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <Text style={styles.actionEmoji}>{'\u{1F4CA}'}</Text>
              <Text style={styles.actionLabel}>Log Activity</Text>
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
    backgroundColor: '#fbf9f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbf9f8',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 14,
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
  },
  moodButtonSelected: {
    backgroundColor: '#e0f2f1',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#226779',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
