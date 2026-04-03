// ============================================================
// app/mood-calendar.tsx — Mood Calendar (Heatmap)
//
// Monthly heatmap of daily moods from journal entries.
// Tap a day to see mood details in a bottom sheet.
// ============================================================

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase, getSession } from '../src/lib/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_MARGIN = 2;
const CALENDAR_PADDING = 20;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - CALENDAR_PADDING * 2 - CELL_MARGIN * 14) / 7);

// Brand colors
const C = {
  primary: '#226779',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  border: '#e5e7eb',
} as const;

// Mood color scale: 1=red (rough), 2=orange, 3=gray (neutral), 4=teal (good), 5=green (great)
const MOOD_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#9ca3af',
  4: '#226779',
  5: '#22c55e',
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type DayData = {
  date: string; // YYYY-MM-DD
  mood: number | null;
  journalCount: number;
  entries: { id: string; mood: number; created_at: string; content_preview?: string }[];
};

type MonthData = Record<string, DayData>;

export default function MoodCalendarScreen() {
  const router = useRouter();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // 0-indexed: 3 = April
  const [monthData, setMonthData] = useState<MonthData>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const monthName = useMemo(
    () =>
      new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
    [year, month],
  );

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const cells: (number | null)[] = [];

    // Leading blanks
    for (let i = 0; i < startDow; i++) {
      cells.push(null);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      cells.push(d);
    }

    // Trailing blanks to fill last row
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [year, month]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Fetch mood data for the current month
  const fetchMonthData = useCallback(async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) return;

      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

      const { data: journals, error } = await supabase
        .from('stringer_journal')
        .select('id, mood, created_at, tributaries')
        .eq('user_id', session.user.id)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[MoodCalendar] Fetch error:', error);
        return;
      }

      const data: MonthData = {};

      (journals ?? []).forEach((j: any) => {
        const dateStr = j.created_at.split('T')[0];
        if (!data[dateStr]) {
          data[dateStr] = {
            date: dateStr,
            mood: null,
            journalCount: 0,
            entries: [],
          };
        }
        data[dateStr].journalCount += 1;
        data[dateStr].entries.push({
          id: j.id,
          mood: j.mood,
          created_at: j.created_at,
          content_preview: j.tributaries
            ? String(j.tributaries).slice(0, 80)
            : undefined,
        });

        // Use the average mood for the day, or the latest
        if (j.mood) {
          const moods = data[dateStr].entries
            .filter((e) => e.mood)
            .map((e) => e.mood);
          data[dateStr].mood = Math.round(
            moods.reduce((a, b) => a + b, 0) / moods.length,
          );
        }
      });

      setMonthData(data);
    } catch (err) {
      console.warn('[MoodCalendar] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  const navigateMonth = useCallback(
    (dir: -1 | 1) => {
      setSelectedDay(null);
      let newMonth = month + dir;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setMonth(newMonth);
      setYear(newYear);
    },
    [month, year],
  );

  const handleDayPress = useCallback(
    (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = monthData[dateStr] ?? {
        date: dateStr,
        mood: null,
        journalCount: 0,
        entries: [],
      };
      setSelectedDay(dayData);
    },
    [year, month, monthData],
  );

  // ── Render ────────────────────────────────────────────────

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
        <Text style={styles.headerTitle}>Mood Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Month navigation */}
      <View style={styles.monthNav}>
        <Pressable onPress={() => navigateMonth(-1)} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={22} color={C.primary} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {monthName} {year}
        </Text>
        <Pressable onPress={() => navigateMonth(1)} style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={22} color={C.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <>
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <View key={`blank-${idx}`} style={styles.dayCell} />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = monthData[dateStr];
              const mood = dayData?.mood ?? null;
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay?.date === dateStr;
              const bgColor = mood ? MOOD_COLORS[mood] : '#f3f4f6';

              return (
                <Pressable
                  key={dateStr}
                  style={[
                    styles.dayCell,
                    { backgroundColor: bgColor },
                    isToday && styles.dayCellToday,
                    isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => handleDayPress(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      mood && mood !== 3 ? { color: '#ffffff' } : { color: C.onSurface },
                      isToday && !mood && { color: C.primary, fontWeight: '700' },
                    ]}
                  >
                    {day}
                  </Text>
                  {dayData && dayData.journalCount > 0 && (
                    <View
                      style={[
                        styles.journalDot,
                        { backgroundColor: mood ? '#ffffff' : C.primary },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Color legend */}
          <View style={styles.legend}>
            {[1, 2, 3, 4, 5].map((m) => (
              <View key={m} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: MOOD_COLORS[m] }]}
                />
                <Text style={styles.legendText}>{MOOD_LABELS[m]}</Text>
              </View>
            ))}
          </View>

          {/* Bottom sheet for selected day */}
          {selectedDay && (
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetDate}>
                  {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString(
                    'default',
                    { weekday: 'long', month: 'long', day: 'numeric' },
                  )}
                </Text>
                <Pressable onPress={() => setSelectedDay(null)}>
                  <Ionicons name="close-circle" size={24} color={C.onSurfaceVariant} />
                </Pressable>
              </View>

              {selectedDay.mood ? (
                <View style={styles.sheetMoodRow}>
                  <View
                    style={[
                      styles.sheetMoodBadge,
                      { backgroundColor: MOOD_COLORS[selectedDay.mood] },
                    ]}
                  >
                    <Text style={styles.sheetMoodBadgeText}>
                      {MOOD_LABELS[selectedDay.mood]}
                    </Text>
                  </View>
                  <Text style={styles.sheetJournalCount}>
                    {selectedDay.journalCount} journal{selectedDay.journalCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              ) : (
                <Text style={styles.sheetEmpty}>No journal entries this day.</Text>
              )}

              {selectedDay.entries.length > 0 && (
                <FlatList
                  data={selectedDay.entries}
                  keyExtractor={(e) => e.id}
                  style={styles.sheetEntries}
                  renderItem={({ item }) => (
                    <View style={styles.sheetEntry}>
                      <View style={styles.sheetEntryHeader}>
                        {item.mood && (
                          <View
                            style={[
                              styles.sheetEntryMoodDot,
                              { backgroundColor: MOOD_COLORS[item.mood] },
                            ]}
                          />
                        )}
                        <Text style={styles.sheetEntryTime}>
                          {new Date(item.created_at).toLocaleTimeString('default', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      {item.content_preview && (
                        <Text style={styles.sheetEntryPreview} numberOfLines={2}>
                          {item.content_preview}
                        </Text>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────

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

  // Month navigation
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 20,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: C.onSurface,
    minWidth: 160,
    textAlign: 'center',
  },

  // Weekday headers
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: CALENDAR_PADDING,
    marginBottom: 4,
  },
  weekdayCell: {
    width: CELL_SIZE,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: CELL_MARGIN,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: CALENDAR_PADDING,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: CELL_MARGIN,
    marginVertical: CELL_MARGIN,
  },
  dayCellToday: {
    borderWidth: 2.5,
    borderColor: C.primary,
  },
  dayCellSelected: {
    borderWidth: 2.5,
    borderColor: C.onSurface,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  journalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.onSurfaceVariant,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetDate: {
    fontSize: 17,
    fontWeight: '700',
    color: C.onSurface,
  },
  sheetMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sheetMoodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sheetMoodBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sheetJournalCount: {
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  sheetEmpty: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  sheetEntries: {
    maxHeight: 160,
  },
  sheetEntry: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sheetEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sheetEntryMoodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetEntryTime: {
    fontSize: 12,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  sheetEntryPreview: {
    fontSize: 13,
    color: C.onSurface,
    lineHeight: 18,
  },
});
