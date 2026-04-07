// ============================================================
// app/gossip-drama.tsx — Gossip & Drama Check Screen
//
// Awareness screen for users with 'gossip_drama' in their goals.
// Lets users reflect on gossip/celebrity consumption and track
// a 7-day pattern. Encouraging, never judgmental.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSession } from '../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

const C = {
  primary: '#226779',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  emerald: '#10b981',
  amber: '#f59e0b',
  border: '#e5e7eb',
} as const;

type ConsumptionLevel = 'none' | 'glanced' | 'scrolled' | 'deep_dive';

interface GossipDay {
  date: string;
  level: ConsumptionLevel;
}

const LEVEL_OPTIONS: { value: ConsumptionLevel; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'none', label: 'None', description: 'Didn\'t look', icon: 'shield-checkmark-outline' },
  { value: 'glanced', label: 'Glanced', description: 'A headline or two', icon: 'eye-outline' },
  { value: 'scrolled', label: 'Scrolled', description: '15+ minutes', icon: 'phone-portrait-outline' },
  { value: 'deep_dive', label: 'Deep Dive', description: '30+ minutes', icon: 'time-outline' },
];

const LEVEL_SCORE: Record<ConsumptionLevel, number> = {
  none: 0,
  glanced: 1,
  scrolled: 2,
  deep_dive: 3,
};

export default function GossipDramaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<GossipDay[]>([]);
  const [level, setLevel] = useState<ConsumptionLevel | null>(null);
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/gossip-consumption`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        if (data.today) {
          setLevel(data.today.level ?? null);
          setSubmitted(true);
        }
      }
    } catch (e) {
      console.warn('[GossipDrama] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !level) return;
    setSubmitting(true);
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/gossip-consumption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ level, reflection }),
      });
      if (res.ok) {
        setSubmitted(true);
        await fetchData();
      }
    } catch (e) {
      console.warn('[GossipDrama] Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [level, reflection, submitting, fetchData]);

  const freeDays = weekData.filter(d => d.level === 'none').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={C.onSurface} />
            </Pressable>
            <View style={styles.headerIcon}>
              <Ionicons name="chatbubbles-outline" size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Drama Check</Text>
              <Text style={styles.headerSubtitle}>
                How much gossip did you consume today?
              </Text>
            </View>
          </View>

          {!submitted ? (
            <View style={styles.form}>
              {/* Level selector */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Gossip &amp; celebrity content today
                </Text>
                <View style={styles.levelGrid}>
                  {LEVEL_OPTIONS.map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setLevel(opt.value)}
                      style={[
                        styles.levelBtn,
                        level === opt.value && styles.levelBtnActive,
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={22}
                        color={level === opt.value ? C.primary : C.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.levelLabel,
                          level === opt.value && styles.levelLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={styles.levelDesc}>{opt.description}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Reflection */}
              {level && level !== 'none' && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    What were you avoiding in your own life?
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Be honest with yourself..."
                    placeholderTextColor={C.onSurfaceVariant}
                    value={reflection}
                    onChangeText={setReflection}
                    multiline
                  />
                </View>
              )}

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={submitting || !level}
                style={[styles.submitBtn, (submitting || !level) && { opacity: 0.6 }]}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitText}>Log Today</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Today summary */}
              <View style={styles.summaryCard}>
                <Ionicons
                  name={level === 'none' ? 'shield-checkmark' : 'checkmark-circle'}
                  size={20}
                  color={level === 'none' ? C.emerald : C.primary}
                />
                <Text style={styles.summaryText}>
                  {level === 'none'
                    ? 'No gossip today. Your story got your full attention.'
                    : `Logged: ${LEVEL_OPTIONS.find(o => o.value === level)?.label ?? level}`}
                </Text>
              </View>

              {/* 7-day dots */}
              <View style={styles.section}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendLabel}>Last 7 days</Text>
                  <Text style={styles.trendAvg}>
                    {freeDays}/7 gossip-free
                  </Text>
                </View>
                <View style={styles.dotsRow}>
                  {weekData.map(day => {
                    const score = LEVEL_SCORE[day.level] ?? 0;
                    const dayLabel = new Date(day.date)
                      .toLocaleDateString('en-US', { weekday: 'short' })
                      .charAt(0);
                    return (
                      <View key={day.date} style={styles.dotCol}>
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor:
                                score === 0
                                  ? C.emerald
                                  : score === 1
                                    ? `${C.primary}60`
                                    : score === 2
                                      ? `${C.amber}90`
                                      : C.error,
                              width: 24 + score * 6,
                              height: 24 + score * 6,
                            },
                          ]}
                        />
                        <Text style={styles.dotLabel}>{dayLabel}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Coaching nudge */}
              <View style={styles.coachBanner}>
                <Ionicons name="heart-outline" size={18} color={C.primary} />
                <Text style={styles.coachText}>
                  Choosing to invest in your own story instead of watching
                  someone else&apos;s{'\u2009'}&mdash;{'\u2009'}that takes real intention.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${C.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.onSurface,
  },
  headerSubtitle: {
    fontSize: 11,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  form: {
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelBtn: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    gap: 4,
  },
  levelBtnActive: {
    backgroundColor: `${C.primary}15`,
    borderColor: `${C.primary}40`,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.onSurface,
  },
  levelLabelActive: {
    color: C.primary,
  },
  levelDesc: {
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  textInput: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 14,
    color: C.onSurface,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  summaryText: {
    fontSize: 13,
    color: C.onSurface,
    flex: 1,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: C.onSurfaceVariant,
  },
  trendAvg: {
    fontSize: 12,
    fontWeight: '700',
    color: C.emerald,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dotCol: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: 20,
    opacity: 0.8,
  },
  dotLabel: {
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  coachBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${C.primary}08`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${C.primary}20`,
    padding: 14,
  },
  coachText: {
    fontSize: 12,
    color: C.onSurface,
    flex: 1,
    lineHeight: 18,
  },
});
