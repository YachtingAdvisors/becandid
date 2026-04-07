// ============================================================
// app/group-detail.tsx — Group Detail
//
// Displays a group's name, member count, invite code (copyable),
// anonymized 7-day focus board, check-in form, and check-in feed.
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
  RefreshControl,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../src/lib/api';

const C = {
  primary: '#226779',
  primaryLight: 'rgba(34,103,121,0.10)',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  border: '#e5e7eb',
  emerald: '#10b981',
  emeraldLight: 'rgba(16,185,129,0.12)',
  amber: '#f59e0b',
  amberLight: 'rgba(245,158,11,0.12)',
  red: '#ef4444',
  redLight: 'rgba(239,68,68,0.10)',
} as const;

const MOOD_OPTIONS = [
  { value: 5, emoji: '\u{1F60A}', label: 'Great' },
  { value: 4, emoji: '\u{1F642}', label: 'Good' },
  { value: 3, emoji: '\u{1F610}', label: 'Okay' },
  { value: 2, emoji: '\u{1F615}', label: 'Tough' },
  { value: 1, emoji: '\u{1F61E}', label: 'Hard' },
] as const;

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type GroupDetail = {
  id: string;
  name: string;
  member_count: number;
  invite_code: string;
  focus_board: FocusBoardCell[][];
  check_ins: CheckIn[];
};

type FocusBoardCell = {
  status: 'completed' | 'partial' | 'missed' | 'empty';
};

type CheckIn = {
  id: string;
  anonymous_label: string;
  mood: number;
  message: string;
  created_at: string;
};

function moodEmoji(mood: number): string {
  const option = MOOD_OPTIONS.find((m) => m.value === mood);
  return option?.emoji ?? '\u{1F610}';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function cellColor(status: FocusBoardCell['status']): string {
  switch (status) {
    case 'completed': return C.emerald;
    case 'partial': return C.amber;
    case 'missed': return C.red;
    default: return '#e5e7eb';
  }
}

function cellBg(status: FocusBoardCell['status']): string {
  switch (status) {
    case 'completed': return C.emeraldLight;
    case 'partial': return C.amberLight;
    case 'missed': return C.redLight;
    default: return '#f3f4f6';
  }
}

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [copied, setCopied] = useState(false);

  // Check-in form
  const [checkInMood, setCheckInMood] = useState<number | null>(null);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get<GroupDetail>(`/api/groups/${id}`);
      setGroup(res);
    } catch (e) {
      console.warn('[GroupDetail] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroup();
    setRefreshing(false);
  }, [fetchGroup]);

  const copyInviteCode = useCallback(async () => {
    if (!group?.invite_code) return;
    await Clipboard.setStringAsync(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [group?.invite_code]);

  const handleCheckIn = useCallback(async () => {
    if (checkInMood === null || !id) return;
    setCheckingIn(true);
    try {
      const res = await apiClient.post<{ check_in: CheckIn }>(`/api/groups/${id}/check-in`, {
        mood: checkInMood,
        message: checkInMessage.trim(),
      });
      setGroup((prev) =>
        prev
          ? { ...prev, check_ins: [res.check_in, ...prev.check_ins] }
          : prev,
      );
      setCheckInMood(null);
      setCheckInMessage('');
    } catch (e) {
      Alert.alert('Error', 'Could not submit check-in.');
      console.warn('[GroupDetail] Check-in error:', e);
    } finally {
      setCheckingIn(false);
    }
  }, [checkInMood, checkInMessage, id]);

  if (loading) {
    return (
      <SafeAreaView style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={s.loadingContainer}>
        <Text style={{ color: C.onSurfaceVariant }}>Group not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={C.onSurface} />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Group Info Card */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoItem}>
              <Ionicons name="people" size={18} color={C.primary} />
              <Text style={s.infoValue}>{group.member_count}</Text>
              <Text style={s.infoLabel}>Members</Text>
            </View>
            <View style={s.infoDivider} />
            <Pressable style={s.infoItem} onPress={copyInviteCode}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'key-outline'}
                size={18}
                color={C.primary}
              />
              <Text style={s.infoValue}>{group.invite_code}</Text>
              <Text style={s.infoLabel}>{copied ? 'Copied!' : 'Tap to copy'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Focus Board (7-day grid) */}
        <Text style={s.sectionTitle}>Focus Board (7 Days)</Text>
        <View style={s.boardCard}>
          {/* Day headers */}
          <View style={s.boardDayRow}>
            {DAYS.map((day, i) => (
              <Text key={i} style={s.boardDayLabel}>{day}</Text>
            ))}
          </View>
          {/* Member rows */}
          {group.focus_board.map((row, rowIdx) => (
            <View key={rowIdx} style={s.boardRow}>
              <Text style={s.boardMemberLabel}>Member {rowIdx + 1}</Text>
              <View style={s.boardCells}>
                {row.map((cell, colIdx) => (
                  <View
                    key={colIdx}
                    style={[s.boardCell, { backgroundColor: cellBg(cell.status) }]}
                  >
                    <View style={[s.boardCellDot, { backgroundColor: cellColor(cell.status) }]} />
                  </View>
                ))}
              </View>
            </View>
          ))}
          {group.focus_board.length === 0 && (
            <Text style={s.boardEmpty}>No activity this week</Text>
          )}
          <View style={s.boardLegend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.emerald }]} />
              <Text style={s.legendText}>On track</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.amber }]} />
              <Text style={s.legendText}>Partial</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: C.red }]} />
              <Text style={s.legendText}>Missed</Text>
            </View>
          </View>
        </View>

        {/* Check-in Form */}
        <Text style={s.sectionTitle}>Check In</Text>
        <View style={s.checkinCard}>
          <Text style={s.checkinLabel}>How are you feeling?</Text>
          <View style={s.moodRow}>
            {MOOD_OPTIONS.map((m) => (
              <Pressable
                key={m.value}
                style={[
                  s.moodButton,
                  checkInMood === m.value && s.moodButtonActive,
                ]}
                onPress={() => setCheckInMood(m.value)}
              >
                <Text style={s.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    s.moodLabel,
                    checkInMood === m.value && { color: C.primary, fontWeight: '600' },
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={s.checkinInput}
            placeholder="Add a message (optional)..."
            placeholderTextColor="#9ca3af"
            value={checkInMessage}
            onChangeText={setCheckInMessage}
            multiline
            maxLength={300}
          />
          <Pressable
            style={[s.checkinSubmit, (checkInMood === null || checkingIn) && { opacity: 0.4 }]}
            onPress={handleCheckIn}
            disabled={checkInMood === null || checkingIn}
          >
            {checkingIn ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={s.checkinSubmitText}>Submit Check-in</Text>
            )}
          </Pressable>
        </View>

        {/* Check-in Feed */}
        {group.check_ins.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Recent Check-ins</Text>
            {group.check_ins.map((ci) => (
              <View key={ci.id} style={s.feedCard}>
                <View style={s.feedHeader}>
                  <View style={s.feedAvatar}>
                    <Text style={s.feedAvatarText}>{ci.anonymous_label.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.feedName}>{ci.anonymous_label}</Text>
                    <Text style={s.feedTime}>{timeAgo(ci.created_at)}</Text>
                  </View>
                  <Text style={s.feedMood}>{moodEmoji(ci.mood)}</Text>
                </View>
                {ci.message ? (
                  <Text style={s.feedMessage}>{ci.message}</Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  container: { flex: 1 },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface, flex: 1, textAlign: 'center', marginHorizontal: 8 },

  // Info card
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoItem: { flex: 1, alignItems: 'center', gap: 4 },
  infoDivider: { width: 1, height: 40, backgroundColor: C.border },
  infoValue: { fontSize: 18, fontWeight: '700', color: C.onSurface, letterSpacing: 1 },
  infoLabel: { fontSize: 12, color: C.onSurfaceVariant },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Focus board
  boardCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 24,
  },
  boardDayRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 72,
    marginBottom: 6,
  },
  boardDayLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  boardMemberLabel: {
    width: 68,
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  boardCells: { flex: 1, flexDirection: 'row', gap: 4 },
  boardCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 32,
  },
  boardCellDot: { width: 8, height: 8, borderRadius: 4 },
  boardEmpty: { fontSize: 14, color: C.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 },
  boardLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: C.onSurfaceVariant },

  // Check-in form
  checkinCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 24,
  },
  checkinLabel: { fontSize: 15, fontWeight: '600', color: C.onSurface, marginBottom: 12 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    flex: 1,
  },
  moodButtonActive: { backgroundColor: C.primaryLight },
  moodEmoji: { fontSize: 24, marginBottom: 4 },
  moodLabel: { fontSize: 11, color: C.onSurfaceVariant },
  checkinInput: {
    fontSize: 15,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 56,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  checkinSubmit: {
    backgroundColor: C.primary,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  checkinSubmitText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },

  // Feed
  feedCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
  },
  feedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedAvatarText: { fontSize: 14, fontWeight: '700', color: C.primary },
  feedName: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  feedTime: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 1 },
  feedMood: { fontSize: 22 },
  feedMessage: { fontSize: 14, color: C.onSurface, lineHeight: 20, marginTop: 10, paddingLeft: 46 },
});
