// ============================================================
// app/doomscrolling.tsx — Doomscrolling News Check Screen
//
// Lets users log daily news consumption, reflect on mood after
// reading, and track a 7-day trend. Only accessible to users
// with 'doomscrolling' in their goals.
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

type NewsMood = 'informed' | 'anxious' | 'angry';

interface NewsDay {
  date: string;
  hours: number;
  mood: NewsMood | null;
}

const MOOD_OPTIONS: { value: NewsMood; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'informed', label: 'Informed', icon: 'book-outline' },
  { value: 'anxious', label: 'Anxious', icon: 'alert-circle-outline' },
  { value: 'angry', label: 'Angry', icon: 'flame-outline' },
];

const HOUR_MARKS = [0, 1, 2, 3, 4];

export default function DoomscrollingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<NewsDay[]>([]);
  const [hours, setHours] = useState(0);
  const [mood, setMood] = useState<NewsMood | null>(null);
  const [actionableNote, setActionableNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/news-consumption`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        if (data.today) {
          setHours(data.today.hours ?? 0);
          setMood(data.today.mood ?? null);
          setSubmitted(true);
        }
      }
    } catch (e) {
      console.warn('[Doomscrolling] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/news-consumption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ hours, mood, actionableNote }),
      });
      if (res.ok) {
        setSubmitted(true);
        await fetchData();
      }
    } catch (e) {
      console.warn('[Doomscrolling] Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [hours, mood, actionableNote, submitting, fetchData]);

  const weekHours = weekData.filter(d => d.hours > 0);
  const weeklyAvg =
    weekHours.length > 0
      ? weekHours.reduce((sum, d) => sum + d.hours, 0) / weekHours.length
      : 0;

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
              <Ionicons name="newspaper-outline" size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>News Check</Text>
              <Text style={styles.headerSubtitle}>
                How much news did you consume today?
              </Text>
            </View>
          </View>

          {!submitted ? (
            <View style={styles.form}>
              {/* Hours selector */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Time spent</Text>
                <Text style={styles.hoursValue}>
                  {hours >= 4 ? '4+ hours' : `${hours} hour${hours !== 1 ? 's' : ''}`}
                </Text>
                <View style={styles.hoursRow}>
                  {HOUR_MARKS.map(h => (
                    <Pressable
                      key={h}
                      onPress={() => setHours(h)}
                      style={[
                        styles.hourBtn,
                        hours === h && styles.hourBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.hourBtnText,
                          hours === h && styles.hourBtnTextActive,
                        ]}
                      >
                        {h >= 4 ? '4+' : h}h
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Mood */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  How do you feel after reading the news?
                </Text>
                <View style={styles.moodRow}>
                  {MOOD_OPTIONS.map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setMood(opt.value)}
                      style={[
                        styles.moodBtn,
                        mood === opt.value && styles.moodBtnActive,
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={22}
                        color={mood === opt.value ? C.primary : C.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.moodLabel,
                          mood === opt.value && styles.moodLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Actionable question */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  What can you actually do about what you read?
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Vote, donate, volunteer, or nothing"
                  placeholderTextColor={C.onSurfaceVariant}
                  value={actionableNote}
                  onChangeText={setActionableNote}
                  multiline
                />
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
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
                <Ionicons name="checkmark-circle" size={20} color={C.emerald} />
                <Text style={styles.summaryText}>
                  <Text style={{ fontWeight: '700' }}>
                    {hours >= 4 ? '4+' : hours} hour{hours !== 1 ? 's' : ''}
                  </Text>
                  {' '}of news today
                  {mood ? ` \u00B7 Feeling ${mood}` : ''}
                </Text>
              </View>

              {/* 7-day trend */}
              <View style={styles.section}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendLabel}>Last 7 days</Text>
                  <Text style={styles.trendAvg}>
                    Avg {weeklyAvg.toFixed(1)}h/day
                  </Text>
                </View>
                <View style={styles.barsRow}>
                  {weekData.map(day => {
                    const pct = Math.max(10, (day.hours / 4) * 100);
                    const isHigh = day.hours > 2;
                    const dayLabel = new Date(day.date)
                      .toLocaleDateString('en-US', { weekday: 'short' })
                      .charAt(0);
                    return (
                      <View key={day.date} style={styles.barCol}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: `${pct}%`,
                                backgroundColor: isHigh
                                  ? C.error
                                  : day.hours > 0
                                    ? C.primary
                                    : C.border,
                                opacity: isHigh ? 0.7 : 0.5,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.barLabel}>{dayLabel}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Warning nudge */}
              {hours > 2 && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning-outline" size={18} color="#92400e" />
                  <Text style={styles.warningText}>
                    You spent more time consuming news than you can act on.
                    Consider a news diet.
                  </Text>
                </View>
              )}

              {/* Suggestion */}
              <View style={styles.suggestionBanner}>
                <Ionicons name="bulb-outline" size={18} color={C.primary} />
                <Text style={styles.suggestionText}>
                  Try checking news once in the morning and once in the evening
                  {'\u2009'}&mdash;{'\u2009'}max 15 minutes each.
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
  hoursValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hourBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  hourBtnActive: {
    backgroundColor: `${C.primary}15`,
    borderColor: `${C.primary}40`,
  },
  hourBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  hourBtnTextActive: {
    color: C.primary,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    gap: 6,
  },
  moodBtnActive: {
    backgroundColor: `${C.primary}15`,
    borderColor: `${C.primary}40`,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  moodLabelActive: {
    color: C.primary,
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
    color: C.primary,
  },
  barsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 64,
    alignItems: 'flex-end',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 14,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
    flex: 1,
    lineHeight: 18,
  },
  suggestionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${C.primary}08`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${C.primary}20`,
    padding: 14,
  },
  suggestionText: {
    fontSize: 12,
    color: C.onSurface,
    flex: 1,
    lineHeight: 18,
  },
});
