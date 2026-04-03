// ============================================================
// app/progress.tsx — Progress Timeline (Modal Screen)
//
// Vertical milestone timeline showing the user's journey.
// Achieved milestones are filled, next up pulses, future ghosted.
// ============================================================

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getSession } from '../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

// Brand colors
const C = {
  primary: '#226779',
  primaryLight: '#e0f2f1',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  border: '#e5e7eb',
  ghosted: '#d1d5db',
} as const;

// ── Milestone definitions ───────────────────────────────────

type MilestoneDef = {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'journal_count' | 'streak_days';
  target: number;
};

const MILESTONES: MilestoneDef[] = [
  {
    key: 'first_journal',
    title: 'First Step',
    description: 'Write your first journal entry',
    icon: 'create-outline',
    type: 'journal_count',
    target: 1,
  },
  {
    key: 'streak_7',
    title: 'One Week Strong',
    description: '7-day journaling streak',
    icon: 'flame-outline',
    type: 'streak_days',
    target: 7,
  },
  {
    key: 'journals_10',
    title: 'Finding Your Voice',
    description: 'Complete 10 journal entries',
    icon: 'book-outline',
    type: 'journal_count',
    target: 10,
  },
  {
    key: 'streak_14',
    title: 'Two Weeks In',
    description: '14-day journaling streak',
    icon: 'flame-outline',
    type: 'streak_days',
    target: 14,
  },
  {
    key: 'journals_25',
    title: 'Going Deeper',
    description: 'Complete 25 journal entries',
    icon: 'book-outline',
    type: 'journal_count',
    target: 25,
  },
  {
    key: 'streak_30',
    title: 'One Month of Honesty',
    description: '30-day journaling streak',
    icon: 'trophy-outline',
    type: 'streak_days',
    target: 30,
  },
  {
    key: 'journals_50',
    title: 'Half Century',
    description: 'Complete 50 journal entries',
    icon: 'star-outline',
    type: 'journal_count',
    target: 50,
  },
  {
    key: 'streak_60',
    title: 'Two Months Strong',
    description: '60-day journaling streak',
    icon: 'shield-checkmark-outline',
    type: 'streak_days',
    target: 60,
  },
  {
    key: 'streak_90',
    title: 'Quarter of a Year',
    description: '90-day journaling streak',
    icon: 'diamond-outline',
    type: 'streak_days',
    target: 90,
  },
];

type MilestoneStatus = 'achieved' | 'next' | 'future';

type MilestoneItem = MilestoneDef & {
  status: MilestoneStatus;
  achievedDate?: string;
  current: number;
  remaining: number;
};

export default function ProgressScreen() {
  const router = useRouter();
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [trustPoints, setTrustPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [journalCount, setJournalCount] = useState(0);

  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Pulse animation for "next" milestone
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/trust-points/stats`, { headers });
      let stats: any = {};
      if (statsRes.ok) {
        stats = await statsRes.json();
      }

      const streak = stats.streakDays ?? stats.streak_days ?? 0;
      const journals = stats.journalCount ?? stats.journal_count ?? stats.totalJournals ?? 0;
      const tp = stats.trustPoints ?? stats.trust_points ?? 0;

      setStreakDays(streak);
      setJournalCount(journals);
      setTrustPoints(tp);

      // Fetch milestone achievement data
      let achievedMilestones: Record<string, string> = {};
      try {
        const msRes = await fetch(`${API_URL}/api/milestones`, { headers });
        if (msRes.ok) {
          const msData = await msRes.json();
          const items = Array.isArray(msData) ? msData : msData.milestones ?? [];
          items.forEach((m: any) => {
            if (m.achieved_at || m.unlocked_at) {
              achievedMilestones[m.key ?? m.milestone_key ?? m.type] =
                m.achieved_at ?? m.unlocked_at;
            }
          });
        }
      } catch {
        // Milestones endpoint may not exist yet; derive from stats
      }

      // Build milestone items
      let foundNext = false;
      const items: MilestoneItem[] = MILESTONES.map((def) => {
        const current =
          def.type === 'streak_days' ? streak : journals;
        const isAchieved =
          achievedMilestones[def.key] !== undefined || current >= def.target;
        const remaining = Math.max(0, def.target - current);

        let status: MilestoneStatus;
        if (isAchieved) {
          status = 'achieved';
        } else if (!foundNext) {
          status = 'next';
          foundNext = true;
        } else {
          status = 'future';
        }

        return {
          ...def,
          status,
          achievedDate: achievedMilestones[def.key],
          current,
          remaining,
        };
      });

      setMilestones(items);
    } catch (err) {
      console.warn('[Progress] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // ── Render ────────────────────────────────────────────────

  const renderMilestone = useCallback(
    ({ item, index }: { item: MilestoneItem; index: number }) => {
      const isLast = index === milestones.length - 1;
      const isAchieved = item.status === 'achieved';
      const isNext = item.status === 'next';
      const isFuture = item.status === 'future';

      const nodeColor = isAchieved
        ? C.primary
        : isNext
          ? C.primary
          : C.ghosted;

      const cardOpacity = isFuture ? 0.45 : 1;

      return (
        <View style={styles.milestoneRow}>
          {/* Left timeline column */}
          <View style={styles.timelineCol}>
            {/* Top line segment */}
            {index > 0 && (
              <View
                style={[
                  styles.timelineLine,
                  styles.timelineLineTop,
                  { backgroundColor: isAchieved ? C.primary : C.ghosted },
                ]}
              />
            )}

            {/* Node circle */}
            {isNext ? (
              <Animated.View
                style={[
                  styles.timelineNode,
                  {
                    borderColor: nodeColor,
                    backgroundColor: 'transparent',
                    opacity: pulseAnim,
                  },
                ]}
              >
                <View
                  style={[
                    styles.timelineNodeInner,
                    { backgroundColor: C.primaryLight },
                  ]}
                />
              </Animated.View>
            ) : (
              <View
                style={[
                  styles.timelineNode,
                  isAchieved
                    ? {
                        backgroundColor: nodeColor,
                        borderColor: nodeColor,
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: C.ghosted,
                      },
                ]}
              >
                {isAchieved && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </View>
            )}

            {/* Bottom line segment */}
            {!isLast && (
              <View
                style={[
                  styles.timelineLine,
                  styles.timelineLineBottom,
                  {
                    backgroundColor: isAchieved ? C.primary : C.ghosted,
                  },
                ]}
              />
            )}
          </View>

          {/* Right card */}
          <View style={[styles.milestoneCard, { opacity: cardOpacity }]}>
            <View style={styles.milestoneCardHeader}>
              <View
                style={[
                  styles.milestoneIconBg,
                  {
                    backgroundColor: isAchieved
                      ? C.primaryLight
                      : '#f3f4f6',
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={isAchieved ? C.primary : C.ghosted}
                />
              </View>
              <View style={styles.milestoneCardText}>
                <Text
                  style={[
                    styles.milestoneTitle,
                    isFuture && { color: C.ghosted },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.milestoneDesc}>{item.description}</Text>
              </View>
            </View>

            {/* Status line */}
            {isAchieved && item.achievedDate && (
              <View style={styles.milestoneStatusRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#22c55e"
                />
                <Text style={styles.milestoneAchievedText}>
                  Achieved{' '}
                  {new Date(item.achievedDate).toLocaleDateString('default', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}
            {isAchieved && !item.achievedDate && (
              <View style={styles.milestoneStatusRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#22c55e"
                />
                <Text style={styles.milestoneAchievedText}>Achieved</Text>
              </View>
            )}
            {isNext && (
              <View style={styles.milestoneStatusRow}>
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={14}
                  color={C.primary}
                />
                <Text style={styles.milestoneNextText}>
                  {item.remaining} {item.type === 'streak_days' ? 'day' : 'journal'}
                  {item.remaining !== 1 ? 's' : ''} away
                </Text>
              </View>
            )}
            {isNext && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, (item.current / item.target) * 100)}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      );
    },
    [milestones, pulseAnim],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBtn}
        >
          <Ionicons name="close" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <>
          {/* Stats summary */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name="trophy-outline" size={16} color={C.primary} />
              <Text style={styles.statValue}>{trustPoints}</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="flame-outline" size={16} color="#f59e0b" />
              <Text style={styles.statValue}>{streakDays}</Text>
              <Text style={styles.statLabel}>day streak</Text>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="book-outline" size={16} color="#8b5cf6" />
              <Text style={styles.statValue}>{journalCount}</Text>
              <Text style={styles.statLabel}>journals</Text>
            </View>
          </View>

          {/* Timeline */}
          <FlatList
            data={milestones}
            renderItem={renderMilestone}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.timelineList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────

const NODE_SIZE = 28;
const TIMELINE_COL_WIDTH = 52;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.onSurface,
  },

  // Stats summary
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.onSurface,
  },
  statLabel: {
    fontSize: 11,
    color: C.onSurfaceVariant,
  },

  // Timeline
  timelineList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  milestoneRow: {
    flexDirection: 'row',
    minHeight: 90,
  },

  // Timeline column (left side with line + node)
  timelineCol: {
    width: TIMELINE_COL_WIDTH,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    width: 2.5,
    left: TIMELINE_COL_WIDTH / 2 - 1.25,
  },
  timelineLineTop: {
    top: 0,
    height: '50%',
  },
  timelineLineBottom: {
    bottom: 0,
    height: '50%',
  },
  timelineNode: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    marginTop: -NODE_SIZE / 2,
    backgroundColor: C.surface,
    zIndex: 1,
  },
  timelineNodeInner: {
    width: NODE_SIZE - 10,
    height: NODE_SIZE - 10,
    borderRadius: (NODE_SIZE - 10) / 2,
  },

  // Milestone card (right side)
  milestoneCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    marginLeft: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  milestoneIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneCardText: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    lineHeight: 16,
  },

  // Status
  milestoneStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  milestoneAchievedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  milestoneNextText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
  },

  // Progress bar (for "next" milestone)
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 2,
  },
});
