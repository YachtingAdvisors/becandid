// ============================================================
// app/(tabs)/activity.tsx — Activity Screen
//
// Shows event history with category filters and manual
// activity logging modal.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSession } from '../../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'social_media', label: 'Social Media', emoji: '\u{1F4F1}' },
  { key: 'gambling', label: 'Gambling', emoji: '\u{1F3B0}' },
  { key: 'pornography', label: 'Pornography', emoji: '\u{1F6AB}' },
  { key: 'substances', label: 'Substances', emoji: '\u{1F48A}' },
  { key: 'gaming', label: 'Gaming', emoji: '\u{1F3AE}' },
  { key: 'shopping', label: 'Shopping', emoji: '\u{1F6D2}' },
  { key: 'custom', label: 'Custom', emoji: '\u{2B50}' },
] as const;

const DURATION_PRESETS = [
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
] as const;

type EventItem = {
  id: string;
  category: string;
  severity: number;
  platform?: string;
  created_at: string;
  metadata?: Record<string, any>;
};

export default function ActivityScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [logModalVisible, setLogModalVisible] = useState(false);

  // Log modal state
  const [logCategory, setLogCategory] = useState('social_media');
  const [logDuration, setLogDuration] = useState<number | null>(null);
  const [logNote, setLogNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/events?limit=50`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data.events ?? []);
      }
    } catch (e) {
      console.warn('[Activity] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const filteredEvents =
    activeFilter === 'all'
      ? events
      : events.filter((e) => e.category === activeFilter);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getCategoryInfo = (cat: string) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found ?? { label: cat, emoji: '\u{1F4CB}' };
  };

  const getSeverityBadge = (severity: number) => {
    if (severity <= 3) return { label: 'Low', color: '#16a34a', bg: '#dcfce7' };
    if (severity <= 6) return { label: 'Medium', color: '#ca8a04', bg: '#fef9c3' };
    return { label: 'High', color: '#dc2626', bg: '#fee2e2' };
  };

  const handleLogSubmit = useCallback(async () => {
    if (!logDuration) {
      Alert.alert('Duration Required', 'Please select a duration.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: logCategory,
          severity: 5,
          platform: 'ios',
          metadata: {
            type: 'self_report',
            duration_minutes: logDuration,
            note: logNote.trim() || undefined,
          },
        }),
      });

      if (res.ok) {
        setLogModalVisible(false);
        setLogCategory('social_media');
        setLogDuration(null);
        setLogNote('');
        await fetchEvents();
      } else {
        Alert.alert('Error', 'Failed to log activity.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
      console.warn('[Activity] Log error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [logCategory, logDuration, logNote, fetchEvents]);

  const renderEvent = ({ item }: { item: EventItem }) => {
    const cat = getCategoryInfo(item.category);
    const sev = getSeverityBadge(item.severity);

    return (
      <View style={styles.eventRow}>
        <View style={styles.eventLeft}>
          <Text style={styles.eventEmoji}>{cat.emoji}</Text>
          <View>
            <Text style={styles.eventCategory}>{cat.label}</Text>
            {item.platform && (
              <Text style={styles.eventPlatform}>{item.platform}</Text>
            )}
          </View>
        </View>
        <View style={styles.eventRight}>
          <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
            <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
          </View>
          <Text style={styles.eventTime}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="analytics-outline" size={48} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No activity recorded yet</Text>
      <Text style={styles.emptySubtext}>
        Events will appear here as they are tracked.
      </Text>
    </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <Pressable style={styles.logButton} onPress={() => setLogModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#226779" />
          <Text style={styles.logButtonText}>Log</Text>
        </Pressable>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.filterPill,
              activeFilter === cat.key && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(cat.key)}
          >
            {cat.emoji ? <Text style={styles.filterEmoji}>{cat.emoji}</Text> : null}
            <Text
              style={[
                styles.filterText,
                activeFilter === cat.key && styles.filterTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#226779" />
        }
      />

      {/* Log Modal */}
      <Modal visible={logModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setLogModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Log Activity</Text>
            <Pressable onPress={handleLogSubmit} disabled={submitting}>
              <Text style={[styles.submitText, submitting && { opacity: 0.5 }]}>
                {submitting ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Category Picker */}
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.categoryOption,
                    logCategory === cat.key && styles.categoryOptionActive,
                  ]}
                  onPress={() => setLogCategory(cat.key)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      logCategory === cat.key && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Duration */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATION_PRESETS.map((d) => (
                <Pressable
                  key={d.value}
                  style={[
                    styles.durationChip,
                    logDuration === d.value && styles.durationChipActive,
                  ]}
                  onPress={() => setLogDuration(d.value)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      logDuration === d.value && styles.durationTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Note */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add context..."
              placeholderTextColor="#9ca3af"
              multiline
              value={logNote}
              onChangeText={setLogNote}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#226779',
  },
  filterScroll: {
    maxHeight: 44,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: '#226779',
    borderColor: '#226779',
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventEmoji: {
    fontSize: 22,
  },
  eventCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  eventPlatform: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  eventRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  // Log Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fbf9f8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#226779',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: '#e0f2f1',
    borderColor: '#226779',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryLabelActive: {
    color: '#226779',
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  durationChipActive: {
    backgroundColor: '#226779',
    borderColor: '#226779',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  durationTextActive: {
    color: '#ffffff',
  },
  noteInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
