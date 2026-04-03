// ============================================================
// app/fasting.tsx — Digital Fasting Screen
//
// Challenge picker, active fast countdown (SVG circle),
// completed fasts list, and fast management.
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { apiClient } from '../src/lib/api';
import { Badge } from '../src/components/ui/Badge';
import { Modal } from '../src/components/ui/Modal';

const C = {
  primary: '#226779',
  primaryLight: 'rgba(34,103,121,0.10)',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  emerald: '#10b981',
  border: '#e5e7eb',
} as const;

// ── Challenge Templates ────────────────────────────────────

type Template = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  durationHours: number | null;
  category: string | null;
};

const TEMPLATES: Template[] = [
  {
    id: '24h',
    title: '24-Hour Fast',
    subtitle: '24h no rival activity',
    icon: 'timer-outline',
    durationHours: 24,
    category: null,
  },
  {
    id: 'weekend',
    title: 'Weekend Unplugged',
    subtitle: 'Fri 6pm to Mon 6am',
    icon: 'calendar-outline',
    durationHours: 60,
    category: null,
  },
  {
    id: 'social-sunset',
    title: 'Social Media Sunset',
    subtitle: 'No social after 8pm, 7 days',
    icon: 'moon-outline',
    durationHours: 168,
    category: 'social_media',
  },
  {
    id: 'morning',
    title: 'Screen-Free Morning',
    subtitle: 'No screens before 9am, 7 days',
    icon: 'sunny-outline',
    durationHours: 168,
    category: 'screens',
  },
  {
    id: 'one-week',
    title: 'One Week Focus',
    subtitle: 'Zero flags, 7 days',
    icon: 'flag-outline',
    durationHours: 168,
    category: null,
  },
  {
    id: 'custom',
    title: 'Custom',
    subtitle: 'Pick duration + category',
    icon: 'create-outline',
    durationHours: null,
    category: null,
  },
];

// ── Types ──────────────────────────────────────────────────

type Fast = {
  id: string;
  template_id: string;
  title: string;
  status: 'active' | 'completed' | 'broken';
  started_at: string;
  ends_at: string;
  completed_at?: string;
  duration_hours: number;
  category?: string;
};

// ── Custom Duration Picker ─────────────────────────────────

const CUSTOM_DURATIONS = [
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
  { label: '14 days', hours: 336 },
];

const CUSTOM_CATEGORIES = [
  { label: 'All Activity', value: null },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Screens', value: 'screens' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'News', value: 'news' },
];

// ── Helpers ────────────────────────────────────────────────

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainHrs = hours % 24;
    return `${days}d ${remainHrs}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ── Component ──────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const CIRCLE_SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function FastingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeFast, setActiveFast] = useState<Fast | null>(null);
  const [completedFasts, setCompletedFasts] = useState<Fast[]>([]);
  const [now, setNow] = useState(Date.now());

  // Custom modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDuration, setCustomDuration] = useState(24);
  const [customCategory, setCustomCategory] = useState<string | null>(null);

  // Timer tick
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeFast) {
      timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeFast]);

  // ── Data Fetching ────────────────────────────────────────

  const fetchFasts = useCallback(async () => {
    try {
      const data = await apiClient.get<{ fasts: Fast[] }>('/api/fasts');
      const fasts = data.fasts ?? [];
      const active = fasts.find((f) => f.status === 'active') ?? null;
      const completed = fasts.filter((f) => f.status !== 'active');
      setActiveFast(active);
      setCompletedFasts(completed);
    } catch (e) {
      console.warn('[Fasting] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFasts();
  }, [fetchFasts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFasts();
    setRefreshing(false);
  }, [fetchFasts]);

  // ── Actions ──────────────────────────────────────────────

  const startFast = useCallback(
    async (template: Template) => {
      if (template.id === 'custom') {
        setShowCustomModal(true);
        return;
      }
      setStarting(true);
      try {
        const data = await apiClient.post<{ fast: Fast }>('/api/fasts', {
          template_id: template.id,
          title: template.title,
          duration_hours: template.durationHours,
          category: template.category,
        });
        setActiveFast(data.fast);
      } catch (e) {
        Alert.alert('Error', 'Could not start fast. Please try again.');
        console.warn('[Fasting] Start error:', e);
      } finally {
        setStarting(false);
      }
    },
    []
  );

  const startCustomFast = useCallback(async () => {
    setShowCustomModal(false);
    setStarting(true);
    try {
      const data = await apiClient.post<{ fast: Fast }>('/api/fasts', {
        template_id: 'custom',
        title: 'Custom Fast',
        duration_hours: customDuration,
        category: customCategory,
      });
      setActiveFast(data.fast);
    } catch (e) {
      Alert.alert('Error', 'Could not start fast. Please try again.');
      console.warn('[Fasting] Start custom error:', e);
    } finally {
      setStarting(false);
    }
  }, [customDuration, customCategory]);

  const breakFast = useCallback(() => {
    Alert.alert(
      'Break Fast',
      'Are you sure you want to end this fast early? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Break Fast',
          style: 'destructive',
          onPress: async () => {
            if (!activeFast) return;
            try {
              await apiClient.patch('/api/fasts', {
                id: activeFast.id,
                action: 'break',
              });
              setActiveFast(null);
              await fetchFasts();
            } catch (e) {
              Alert.alert('Error', 'Could not break fast.');
              console.warn('[Fasting] Break error:', e);
            }
          },
        },
      ]
    );
  }, [activeFast, fetchFasts]);

  // ── Timer Calculations ───────────────────────────────────

  const getProgress = (): number => {
    if (!activeFast) return 0;
    const start = new Date(activeFast.started_at).getTime();
    const end = new Date(activeFast.ends_at).getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max(elapsed / total, 0), 1);
  };

  const getTimeRemaining = (): number => {
    if (!activeFast) return 0;
    const end = new Date(activeFast.ends_at).getTime();
    return Math.max(end - now, 0);
  };

  // ── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  const progress = getProgress();
  const remaining = getTimeRemaining();
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

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
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={C.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Digital Fasting</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Active Fast */}
        {activeFast ? (
          <View style={styles.activeFastContainer}>
            <Text style={styles.activeFastLabel}>Current Fast</Text>
            <Text style={styles.activeFastTitle}>{activeFast.title}</Text>

            {/* Circular Timer */}
            <View style={styles.timerContainer}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                {/* Background circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke={C.border}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke={C.primary}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  rotation="-90"
                  origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.timerTextOverlay}>
                <Text style={styles.timerBigText}>{formatTimeRemaining(remaining)}</Text>
                <Text style={styles.timerPercent}>{Math.round(progress * 100)}% complete</Text>
              </View>
            </View>

            {/* Start / End labels */}
            <View style={styles.timeLabelsRow}>
              <View style={styles.timeLabel}>
                <Text style={styles.timeLabelTitle}>Started</Text>
                <Text style={styles.timeLabelValue}>
                  {new Date(activeFast.started_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.timeLabel}>
                <Text style={styles.timeLabelTitle}>Ends</Text>
                <Text style={styles.timeLabelValue}>
                  {new Date(activeFast.ends_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {/* Break Fast Button */}
            <Pressable style={styles.breakFastButton} onPress={breakFast}>
              <Ionicons name="close-circle-outline" size={20} color={C.error} />
              <Text style={styles.breakFastText}>Break Fast</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Challenge Picker */}
            <Text style={styles.sectionTitle}>Choose a Challenge</Text>
            <View style={styles.templateGrid}>
              {TEMPLATES.map((template) => (
                <Pressable
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => startFast(template)}
                  disabled={starting}
                >
                  <View style={styles.templateIconWrapper}>
                    <Ionicons name={template.icon} size={24} color={C.primary} />
                  </View>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateSubtitle}>{template.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Completed Fasts */}
        {completedFasts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Completed Fasts</Text>
            {completedFasts.map((fast) => (
              <View key={fast.id} style={styles.completedCard}>
                <View style={styles.completedCardLeft}>
                  <Text style={styles.completedTitle}>{fast.title}</Text>
                  <Text style={styles.completedDate}>{formatDate(fast.started_at)}</Text>
                </View>
                <View style={styles.completedCardRight}>
                  <Text style={styles.completedDuration}>
                    {formatDuration(fast.duration_hours)}
                  </Text>
                  <Badge
                    text={fast.status === 'completed' ? 'Completed' : 'Broken'}
                    variant={fast.status === 'completed' ? 'active' : 'high'}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {completedFasts.length === 0 && !activeFast && (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color={C.border} />
            <Text style={styles.emptyText}>
              Start your first digital fast to begin building healthier habits.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Fast Modal */}
      <Modal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Custom Fast"
      >
        <Text style={styles.modalLabel}>Duration</Text>
        <View style={styles.modalOptions}>
          {CUSTOM_DURATIONS.map((d) => (
            <Pressable
              key={d.hours}
              style={[
                styles.modalOption,
                customDuration === d.hours && styles.modalOptionSelected,
              ]}
              onPress={() => setCustomDuration(d.hours)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  customDuration === d.hours && styles.modalOptionTextSelected,
                ]}
              >
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.modalLabel, { marginTop: 20 }]}>Category</Text>
        <View style={styles.modalOptions}>
          {CUSTOM_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.label}
              style={[
                styles.modalOption,
                customCategory === cat.value && styles.modalOptionSelected,
              ]}
              onPress={() => setCustomCategory(cat.value)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  customCategory === cat.value && styles.modalOptionTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.modalStartButton} onPress={startCustomFast}>
          <Text style={styles.modalStartButtonText}>Start Fast</Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────

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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.onSurface,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
  },

  // ── Template Grid ──────────────────────────────────────
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  templateCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  templateIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 4,
  },
  templateSubtitle: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    lineHeight: 16,
  },

  // ── Active Fast ────────────────────────────────────────
  activeFastContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  activeFastLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  activeFastTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 24,
  },
  timerContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerTextOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerBigText: {
    fontSize: 28,
    fontWeight: '700',
    color: C.onSurface,
    fontVariant: ['tabular-nums'],
  },
  timerPercent: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    marginTop: 4,
  },
  timeLabelsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  timeLabel: {
    alignItems: 'center',
  },
  timeLabelTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  timeLabelValue: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurface,
  },
  breakFastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: C.error,
  },
  breakFastText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.error,
  },

  // ── Completed Fasts ────────────────────────────────────
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  completedCardLeft: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.onSurface,
  },
  completedDate: {
    fontSize: 13,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  completedCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  completedDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
  },

  // ── Empty State ────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },

  // ── Custom Modal ───────────────────────────────────────
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 10,
  },
  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  modalOptionSelected: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  modalOptionText: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: C.primary,
  },
  modalStartButton: {
    marginTop: 24,
    backgroundColor: C.primary,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalStartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
