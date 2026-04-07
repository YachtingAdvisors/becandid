// ============================================================
// app/amends.tsx — Making Amends
//
// List of amends with status progression, add-person form,
// and therapist sharing toggle.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
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
  emeraldLight: 'rgba(16,185,129,0.10)',
  amber: '#f59e0b',
  amberLight: 'rgba(245,158,11,0.10)',
  violet: '#8b5cf6',
  violetLight: 'rgba(139,92,246,0.10)',
} as const;

const STATUSES = [
  { key: 'identified', label: 'Identified', icon: 'person-outline' as const, color: C.onSurfaceVariant },
  { key: 'reflected', label: 'Reflected', icon: 'bulb-outline' as const, color: C.amber },
  { key: 'reached_out', label: 'Reached Out', icon: 'chatbubble-outline' as const, color: C.violet },
  { key: 'in_progress', label: 'In Progress', icon: 'refresh-outline' as const, color: C.primary },
  { key: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' as const, color: C.emerald },
] as const;

type AmendStatus = (typeof STATUSES)[number]['key'];

type Amend = {
  id: string;
  person_name: string;
  relationship: string;
  status: AmendStatus;
  notes: string;
  share_with_therapist: boolean;
  created_at: string;
};

function statusInfo(status: AmendStatus) {
  return STATUSES.find((s) => s.key === status) ?? STATUSES[0];
}

function nextStatus(current: AmendStatus): AmendStatus | null {
  const idx = STATUSES.findIndex((s) => s.key === current);
  if (idx < 0 || idx >= STATUSES.length - 1) return null;
  return STATUSES[idx + 1].key;
}

export default function AmendsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amends, setAmends] = useState<Amend[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Add person form
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAmends = useCallback(async () => {
    try {
      const res = await apiClient.get<{ amends: Amend[] }>('/api/amends');
      setAmends(res.amends ?? []);
    } catch (e) {
      console.warn('[Amends] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmends();
  }, [fetchAmends]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAmends();
    setRefreshing(false);
  }, [fetchAmends]);

  const handleAdd = useCallback(async () => {
    const name = formName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ amend: Amend }>('/api/amends', {
        person_name: name,
        relationship: formRelation.trim(),
        notes: formNotes.trim(),
      });
      setAmends((prev) => [res.amend, ...prev]);
      setFormName('');
      setFormRelation('');
      setFormNotes('');
      setShowForm(false);
    } catch (e) {
      Alert.alert('Error', 'Could not add person.');
      console.warn('[Amends] Add error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [formName, formRelation, formNotes]);

  const handleAdvanceStatus = useCallback(async (amend: Amend) => {
    const next = nextStatus(amend.status);
    if (!next) return;
    const nextInfo = statusInfo(next);

    // Optimistic update
    setAmends((prev) =>
      prev.map((a) => (a.id === amend.id ? { ...a, status: next } : a)),
    );

    try {
      await apiClient.patch(`/api/amends/${amend.id}`, { status: next });
    } catch (e) {
      // Rollback
      setAmends((prev) =>
        prev.map((a) => (a.id === amend.id ? { ...a, status: amend.status } : a)),
      );
      Alert.alert('Error', `Could not update status to "${nextInfo.label}".`);
    }
  }, []);

  const handleToggleShare = useCallback(async (amend: Amend, value: boolean) => {
    setAmends((prev) =>
      prev.map((a) => (a.id === amend.id ? { ...a, share_with_therapist: value } : a)),
    );
    try {
      await apiClient.patch(`/api/amends/${amend.id}`, { share_with_therapist: value });
    } catch (e) {
      setAmends((prev) =>
        prev.map((a) =>
          a.id === amend.id ? { ...a, share_with_therapist: !value } : a,
        ),
      );
    }
  }, []);

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
          <Text style={s.headerTitle}>Making Amends</Text>
          <Pressable onPress={() => setShowForm(!showForm)} hitSlop={12}>
            <Ionicons
              name={showForm ? 'close' : 'add-circle-outline'}
              size={24}
              color={C.primary}
            />
          </Pressable>
        </View>

        {/* Add Person Form */}
        {showForm && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Add a Person</Text>
            <View style={s.formField}>
              <Text style={s.formLabel}>Name</Text>
              <TextInput
                style={s.formInput}
                placeholder="Their name"
                placeholderTextColor="#9ca3af"
                value={formName}
                onChangeText={setFormName}
                autoFocus
              />
            </View>
            <View style={s.formField}>
              <Text style={s.formLabel}>Relationship</Text>
              <TextInput
                style={s.formInput}
                placeholder="e.g., Spouse, Friend, Parent"
                placeholderTextColor="#9ca3af"
                value={formRelation}
                onChangeText={setFormRelation}
              />
            </View>
            <View style={s.formField}>
              <Text style={s.formLabel}>Notes (optional)</Text>
              <TextInput
                style={[s.formInput, { minHeight: 60, textAlignVertical: 'top' }]}
                placeholder="What happened and what you want to make right..."
                placeholderTextColor="#9ca3af"
                value={formNotes}
                onChangeText={setFormNotes}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              style={[s.formSubmit, (!formName.trim() || submitting) && { opacity: 0.4 }]}
              onPress={handleAdd}
              disabled={!formName.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={s.formSubmitText}>Add Person</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Status Legend */}
        <View style={s.legendRow}>
          {STATUSES.map((st) => (
            <View key={st.key} style={s.legendItem}>
              <Ionicons name={st.icon} size={14} color={st.color} />
              <Text style={[s.legendText, { color: st.color }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Amends List */}
        {amends.length > 0 ? (
          amends.map((amend) => {
            const info = statusInfo(amend.status);
            const next = nextStatus(amend.status);
            const nextInfo = next ? statusInfo(next) : null;
            const isCompleted = amend.status === 'completed';

            return (
              <View key={amend.id} style={[s.amendCard, isCompleted && s.amendCardCompleted]}>
                <View style={s.amendHeader}>
                  <View style={s.amendAvatarWrap}>
                    <View style={[s.amendAvatar, { backgroundColor: info.color + '18' }]}>
                      <Ionicons name={info.icon} size={20} color={info.color} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.amendName}>{amend.person_name}</Text>
                    {amend.relationship ? (
                      <Text style={s.amendRelation}>{amend.relationship}</Text>
                    ) : null}
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: info.color + '18' }]}>
                    <Text style={[s.statusBadgeText, { color: info.color }]}>
                      {info.label}
                    </Text>
                  </View>
                </View>

                {amend.notes ? (
                  <Text style={s.amendNotes}>{amend.notes}</Text>
                ) : null}

                {/* Status progression */}
                <View style={s.progressRow}>
                  {STATUSES.map((st, idx) => {
                    const currentIdx = STATUSES.findIndex((ss) => ss.key === amend.status);
                    const isDone = idx <= currentIdx;
                    return (
                      <View key={st.key} style={s.progressStep}>
                        <View
                          style={[
                            s.progressDot,
                            isDone ? { backgroundColor: st.color } : { backgroundColor: '#e5e7eb' },
                          ]}
                        />
                        {idx < STATUSES.length - 1 && (
                          <View
                            style={[
                              s.progressLine,
                              idx < currentIdx
                                ? { backgroundColor: STATUSES[idx + 1].color }
                                : { backgroundColor: '#e5e7eb' },
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>

                <View style={s.amendActions}>
                  {nextInfo && (
                    <Pressable
                      style={s.advanceButton}
                      onPress={() => handleAdvanceStatus(amend)}
                    >
                      <Ionicons name={nextInfo.icon} size={16} color={C.primary} />
                      <Text style={s.advanceText}>Mark as {nextInfo.label}</Text>
                    </Pressable>
                  )}
                  <View style={s.shareRow}>
                    <Text style={s.shareLabel}>Share with therapist</Text>
                    <Switch
                      value={amend.share_with_therapist}
                      onValueChange={(v) => handleToggleShare(amend, v)}
                      trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                      thumbColor={amend.share_with_therapist ? '#16a34a' : '#f4f4f5'}
                      ios_backgroundColor="#e5e7eb"
                    />
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <Ionicons name="hand-left-outline" size={48} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>No Amends Yet</Text>
            <Text style={s.emptyText}>
              Tap the + button to add someone you want to make amends with.
            </Text>
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

  // Form
  formCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: C.onSurface, marginBottom: 14 },
  formField: { marginBottom: 12 },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    marginBottom: 6,
  },
  formInput: {
    fontSize: 15,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  formSubmit: {
    backgroundColor: C.primary,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
  },
  formSubmitText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },

  // Legend
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendText: { fontSize: 11, fontWeight: '500' },

  // Amend card
  amendCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  amendCardCompleted: { borderColor: C.emerald, borderWidth: 1.5 },
  amendHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  amendAvatarWrap: {},
  amendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amendName: { fontSize: 16, fontWeight: '600', color: C.onSurface },
  amendRelation: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  amendNotes: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 12,
    paddingLeft: 52,
  },

  // Progress dots
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  progressStep: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressLine: { flex: 1, height: 2 },

  // Actions
  amendActions: { gap: 8 },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  advanceText: { fontSize: 14, fontWeight: '600', color: C.primary },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  shareLabel: { fontSize: 14, color: C.onSurfaceVariant },

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
  emptyText: { fontSize: 15, color: C.onSurfaceVariant, textAlign: 'center', maxWidth: 280, lineHeight: 22 },
});
