// ============================================================
// app/letters.tsx — Letter to Future Self
//
// Write a letter with mood selector, view sealed letters
// (hidden content), and read delivered letters.
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  amber: '#f59e0b',
  amberLight: 'rgba(245,158,11,0.10)',
  violet: '#8b5cf6',
  violetLight: 'rgba(139,92,246,0.10)',
} as const;

const MOOD_OPTIONS = [
  { value: 'hopeful', emoji: '\u{2728}', label: 'Hopeful' },
  { value: 'determined', emoji: '\u{1F4AA}', label: 'Determined' },
  { value: 'grateful', emoji: '\u{1F64F}', label: 'Grateful' },
  { value: 'reflective', emoji: '\u{1F4AD}', label: 'Reflective' },
  { value: 'vulnerable', emoji: '\u{1F497}', label: 'Vulnerable' },
] as const;

const DELIVER_OPTIONS = [
  { days: 7, label: '1 Week' },
  { days: 30, label: '1 Month' },
  { days: 90, label: '3 Months' },
  { days: 180, label: '6 Months' },
  { days: 365, label: '1 Year' },
] as const;

type LetterMood = (typeof MOOD_OPTIONS)[number]['value'];

type Letter = {
  id: string;
  body: string;
  mood: LetterMood;
  status: 'sealed' | 'delivered';
  created_at: string;
  deliver_at: string;
  delivered_at: string | null;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function moodEmoji(mood: string): string {
  const option = MOOD_OPTIONS.find((m) => m.value === mood);
  return option?.emoji ?? '\u{2728}';
}

function moodLabel(mood: string): string {
  const option = MOOD_OPTIONS.find((m) => m.value === mood);
  return option?.label ?? mood;
}

export default function LettersScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [letters, setLetters] = useState<Letter[]>([]);

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<LetterMood>('hopeful');
  const [deliverDays, setDeliverDays] = useState(30);
  const [sending, setSending] = useState(false);

  const fetchLetters = useCallback(async () => {
    try {
      const res = await apiClient.get<{ letters: Letter[] }>('/api/letters');
      setLetters(res.letters ?? []);
    } catch (e) {
      console.warn('[Letters] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLetters();
    setRefreshing(false);
  }, [fetchLetters]);

  const handleSend = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const res = await apiClient.post<{ letter: Letter }>('/api/letters', {
        body: trimmed,
        mood,
        deliver_in_days: deliverDays,
      });
      setLetters((prev) => [res.letter, ...prev]);
      setBody('');
      setMood('hopeful');
      setDeliverDays(30);
      setShowCompose(false);
      Alert.alert('Letter Sealed', 'Your letter has been sealed and will be delivered on the chosen date.');
    } catch (e) {
      Alert.alert('Error', 'Could not seal your letter.');
      console.warn('[Letters] Send error:', e);
    } finally {
      setSending(false);
    }
  }, [body, mood, deliverDays]);

  const sealedLetters = letters.filter((l) => l.status === 'sealed');
  const deliveredLetters = letters.filter((l) => l.status === 'delivered');

  if (loading) {
    return (
      <SafeAreaView style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
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
          <Text style={s.headerTitle}>Letters to Future Self</Text>
          <Pressable onPress={() => setShowCompose(!showCompose)} hitSlop={12}>
            <Ionicons
              name={showCompose ? 'close' : 'create-outline'}
              size={24}
              color={C.primary}
            />
          </Pressable>
        </View>

        {/* Compose */}
        {showCompose && (
          <View style={s.composeCard}>
            <Text style={s.composeTitle}>Write Your Letter</Text>

            {/* Mood selector */}
            <Text style={s.composeLabel}>Current Mood</Text>
            <View style={s.moodRow}>
              {MOOD_OPTIONS.map((m) => (
                <Pressable
                  key={m.value}
                  style={[s.moodButton, mood === m.value && s.moodButtonActive]}
                  onPress={() => setMood(m.value)}
                >
                  <Text style={s.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      s.moodLabel,
                      mood === m.value && { color: C.primary, fontWeight: '600' },
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Letter body */}
            <Text style={s.composeLabel}>Your Message</Text>
            <TextInput
              style={s.composeInput}
              placeholder="Dear future me..."
              placeholderTextColor="#9ca3af"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />

            {/* Delivery time */}
            <Text style={s.composeLabel}>Deliver In</Text>
            <View style={s.deliverRow}>
              {DELIVER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.days}
                  style={[
                    s.deliverPill,
                    deliverDays === opt.days && s.deliverPillActive,
                  ]}
                  onPress={() => setDeliverDays(opt.days)}
                >
                  <Text
                    style={[
                      s.deliverPillText,
                      deliverDays === opt.days && { color: '#ffffff', fontWeight: '600' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[s.sealButton, (!body.trim() || sending) && { opacity: 0.4 }]}
              onPress={handleSend}
              disabled={!body.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={18} color="#ffffff" />
                  <Text style={s.sealButtonText}>Seal Letter</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Sealed Letters */}
        {sealedLetters.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Sealed Letters</Text>
            {sealedLetters.map((letter) => {
              const remaining = daysUntil(letter.deliver_at);
              return (
                <View key={letter.id} style={s.sealedCard}>
                  <View style={s.envelopeIcon}>
                    <Ionicons name="mail" size={24} color={C.amber} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.sealedHeaderRow}>
                      <Text style={s.sealedMood}>
                        {moodEmoji(letter.mood)} {moodLabel(letter.mood)}
                      </Text>
                      <View style={s.sealedBadge}>
                        <Ionicons name="lock-closed" size={10} color={C.amber} />
                        <Text style={s.sealedBadgeText}>Sealed</Text>
                      </View>
                    </View>
                    <Text style={s.sealedDate}>
                      Written {formatDate(letter.created_at)}
                    </Text>
                    <Text style={s.sealedDelivery}>
                      {remaining > 0
                        ? `Opens in ${remaining} day${remaining !== 1 ? 's' : ''}`
                        : 'Ready to open!'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Delivered Letters */}
        {deliveredLetters.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Delivered Letters</Text>
            {deliveredLetters.map((letter) => (
              <View key={letter.id} style={s.deliveredCard}>
                <View style={s.deliveredHeader}>
                  <View style={s.deliveredIconWrap}>
                    <Ionicons name="mail-open" size={20} color={C.emerald} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.deliveredMood}>
                      {moodEmoji(letter.mood)} {moodLabel(letter.mood)}
                    </Text>
                    <Text style={s.deliveredDate}>
                      Written {formatDate(letter.created_at)} · Delivered {formatDate(letter.delivered_at ?? letter.deliver_at)}
                    </Text>
                  </View>
                </View>
                <View style={s.deliveredBody}>
                  <Text style={s.deliveredText}>{letter.body}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Empty state */}
        {letters.length === 0 && !showCompose && (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <Ionicons name="mail-outline" size={48} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>Write to Your Future Self</Text>
            <Text style={s.emptyText}>
              Capture your thoughts, hopes, and commitments. Your letter will be delivered on the date you choose.
            </Text>
            <Pressable style={s.emptyButton} onPress={() => setShowCompose(true)}>
              <Ionicons name="create-outline" size={18} color="#ffffff" />
              <Text style={s.emptyButtonText}>Write a Letter</Text>
            </Pressable>
          </View>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
  },

  // Compose
  composeCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 24,
  },
  composeTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface, marginBottom: 16 },
  composeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 4,
  },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    flex: 1,
  },
  moodButtonActive: { backgroundColor: C.primaryLight },
  moodEmoji: { fontSize: 22, marginBottom: 4 },
  moodLabel: { fontSize: 10, color: C.onSurfaceVariant },
  composeInput: {
    fontSize: 15,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 120,
    lineHeight: 22,
    marginBottom: 16,
  },
  deliverRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  deliverPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.border,
  },
  deliverPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  deliverPillText: { fontSize: 13, color: C.onSurfaceVariant },
  sealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 9999,
    minHeight: 48,
  },
  sealButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Sealed letters
  sealedCard: {
    flexDirection: 'row',
    backgroundColor: C.amberLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    padding: 16,
    marginBottom: 10,
    gap: 14,
    alignItems: 'flex-start',
  },
  envelopeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sealedMood: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  sealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245,158,11,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  sealedBadgeText: { fontSize: 11, fontWeight: '600', color: C.amber },
  sealedDate: { fontSize: 12, color: C.onSurfaceVariant, marginBottom: 2 },
  sealedDelivery: { fontSize: 13, color: C.amber, fontWeight: '600' },

  // Delivered letters
  deliveredCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  deliveredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  deliveredIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveredMood: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  deliveredDate: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 },
  deliveredBody: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.emerald,
  },
  deliveredText: { fontSize: 14, color: C.onSurface, lineHeight: 22 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.onSurface, marginBottom: 8 },
  emptyText: { fontSize: 15, color: C.onSurfaceVariant, textAlign: 'center', maxWidth: 280, lineHeight: 22, marginBottom: 24 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    minHeight: 48,
  },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
