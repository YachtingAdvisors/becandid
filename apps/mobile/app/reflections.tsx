// ============================================================
// app/reflections.tsx — Weekly Reflections
//
// Displays a FlatList of weekly reflections with expandable
// narrative text, theme pills, growth/insight highlights,
// looking-ahead question, and mood average badge.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Badge } from '../src/components/ui/Badge';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = {
  primary: '#226779',
  primaryLight: 'rgba(34,103,121,0.10)',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  emerald: '#10b981',
  emeraldLight: 'rgba(16,185,129,0.10)',
  teal: '#0d9488',
  tealLight: 'rgba(13,148,136,0.10)',
  border: '#e5e7eb',
} as const;

// ── Types ──────────────────────────────────────────────────

type Reflection = {
  id: string;
  week_start: string;
  week_end: string;
  narrative: string;
  themes: string[];
  growth_moment: string | null;
  insight: string | null;
  looking_ahead: string | null;
  mood_average: number | null;
  created_at: string;
};

// ── Helpers ────────────────────────────────────────────────

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  const sDay = s.getDate();
  const eDay = e.getDate();
  const year = e.getFullYear();

  if (sMonth === eMonth) {
    return `${sMonth} ${sDay}–${eDay}, ${year}`;
  }
  return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${year}`;
}

function moodLabel(avg: number): string {
  if (avg <= 2) return 'Great';
  if (avg <= 4) return 'Good';
  if (avg <= 6) return 'Okay';
  if (avg <= 8) return 'Struggling';
  return 'Tough';
}

function moodVariant(avg: number): 'active' | 'low' | 'medium' | 'high' {
  if (avg <= 3) return 'active';
  if (avg <= 5) return 'low';
  if (avg <= 7) return 'medium';
  return 'high';
}

// ── Reflection Card Component ──────────────────────────────

function ReflectionCard({ item }: { item: Reflection }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const narrativePreview =
    item.narrative.length > 150 ? item.narrative.slice(0, 150) + '...' : item.narrative;

  return (
    <View style={styles.reflectionCard}>
      {/* Header: week range + mood */}
      <View style={styles.reflectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.reflectionWeek}>
            {formatWeekRange(item.week_start, item.week_end)}
          </Text>
        </View>
        {item.mood_average != null && (
          <Badge
            text={`${moodLabel(item.mood_average)} (${item.mood_average.toFixed(1)})`}
            variant={moodVariant(item.mood_average)}
          />
        )}
      </View>

      {/* Narrative */}
      <Pressable onPress={toggleExpand}>
        <Text style={styles.narrativeText}>
          {expanded ? item.narrative : narrativePreview}
        </Text>
        {item.narrative.length > 150 && (
          <Text style={styles.expandToggle}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        )}
      </Pressable>

      {/* Theme Pills */}
      {item.themes && item.themes.length > 0 && (
        <View style={styles.themesRow}>
          {item.themes.map((theme) => (
            <View key={theme} style={styles.themePill}>
              <Text style={styles.themePillText}>{theme}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Growth Moment */}
      {item.growth_moment && (
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Ionicons name="trending-up" size={16} color={C.emerald} />
            <Text style={styles.highlightLabel}>Growth Moment</Text>
          </View>
          <Text style={styles.highlightText}>{item.growth_moment}</Text>
        </View>
      )}

      {/* Insight */}
      {item.insight && (
        <View style={[styles.highlightCard, styles.insightCard]}>
          <View style={styles.highlightHeader}>
            <Ionicons name="bulb-outline" size={16} color={C.teal} />
            <Text style={[styles.highlightLabel, { color: C.teal }]}>Insight</Text>
          </View>
          <Text style={styles.highlightText}>{item.insight}</Text>
        </View>
      )}

      {/* Looking Ahead */}
      {item.looking_ahead && (
        <View style={styles.lookingAheadContainer}>
          <Ionicons name="arrow-forward-circle-outline" size={16} color={C.onSurfaceVariant} />
          <Text style={styles.lookingAheadText}>{item.looking_ahead}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function ReflectionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  const fetchReflections = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weekly_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[Reflections] Supabase error:', error.message);
        return;
      }

      setReflections(data ?? []);
    } catch (e) {
      console.warn('[Reflections] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReflections();
    setRefreshing(false);
  }, [fetchReflections]);

  // ── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Weekly Reflections</Text>
        <View style={{ width: 24 }} />
      </View>

      {reflections.length > 0 ? (
        <FlatList
          data={reflections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReflectionCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="journal-outline" size={56} color={C.border} />
          <Text style={styles.emptyTitle}>No Reflections Yet</Text>
          <Text style={styles.emptyText}>
            Weekly reflections are generated from your journal entries and check-ins. Keep using
            Be Candid and your first reflection will appear here.
          </Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.onSurface,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },

  // ── Reflection Card ────────────────────────────────────
  reflectionCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  reflectionWeek: {
    fontSize: 16,
    fontWeight: '700',
    color: C.onSurface,
  },

  // ── Narrative ──────────────────────────────────────────
  narrativeText: {
    fontSize: 15,
    color: C.onSurface,
    lineHeight: 22,
  },
  expandToggle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
    marginTop: 6,
  },

  // ── Themes ─────────────────────────────────────────────
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  themePill: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  themePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },

  // ── Highlights ─────────────────────────────────────────
  highlightCard: {
    backgroundColor: C.emeraldLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  insightCard: {
    backgroundColor: C.tealLight,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.emerald,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  highlightText: {
    fontSize: 14,
    color: C.onSurface,
    lineHeight: 20,
  },

  // ── Looking Ahead ──────────────────────────────────────
  lookingAheadContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  lookingAheadText: {
    flex: 1,
    fontSize: 14,
    color: C.onSurfaceVariant,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // ── Empty State ────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.onSurface,
  },
  emptyText: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
});
