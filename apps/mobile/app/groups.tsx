// ============================================================
// app/groups.tsx — Group List + Create / Join
//
// Lists the user's groups from /api/groups. Inline forms to
// create a new group or join by invite code. Tap to navigate
// to group-detail.tsx.
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
} as const;

type Group = {
  id: string;
  name: string;
  member_count: number;
  last_activity: string | null;
  invite_code: string;
};

function formatRelative(iso: string | null): string {
  if (!iso) return 'No activity';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Active now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function GroupsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  // Inline forms
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await apiClient.get<{ groups: Group[] }>('/api/groups');
      setGroups(res.groups ?? []);
    } catch (e) {
      console.warn('[Groups] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  }, [fetchGroups]);

  const handleCreate = useCallback(async () => {
    const name = newGroupName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ group: Group }>('/api/groups', { name });
      setGroups((prev) => [res.group, ...prev]);
      setNewGroupName('');
      setShowCreate(false);
    } catch (e) {
      Alert.alert('Error', 'Could not create group.');
      console.warn('[Groups] Create error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [newGroupName]);

  const handleJoin = useCallback(async () => {
    const code = joinCode.trim();
    if (!code) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ group: Group }>('/api/groups/join', {
        invite_code: code,
      });
      setGroups((prev) => [res.group, ...prev]);
      setJoinCode('');
      setShowJoin(false);
    } catch (e) {
      Alert.alert('Error', 'Invalid invite code or group not found.');
      console.warn('[Groups] Join error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [joinCode]);

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
          <Text style={s.headerTitle}>Groups</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Action Buttons */}
        <View style={s.actionRow}>
          <Pressable
            style={[s.actionButton, showCreate && s.actionButtonActive]}
            onPress={() => {
              setShowCreate(!showCreate);
              setShowJoin(false);
            }}
          >
            <Ionicons name="add-circle-outline" size={18} color={showCreate ? '#ffffff' : C.primary} />
            <Text style={[s.actionButtonText, showCreate && { color: '#ffffff' }]}>Create</Text>
          </Pressable>
          <Pressable
            style={[s.actionButton, showJoin && s.actionButtonActive]}
            onPress={() => {
              setShowJoin(!showJoin);
              setShowCreate(false);
            }}
          >
            <Ionicons name="enter-outline" size={18} color={showJoin ? '#ffffff' : C.primary} />
            <Text style={[s.actionButtonText, showJoin && { color: '#ffffff' }]}>Join</Text>
          </Pressable>
        </View>

        {/* Create Form */}
        {showCreate && (
          <View style={s.inlineForm}>
            <Text style={s.formLabel}>Group Name</Text>
            <TextInput
              style={s.formInput}
              placeholder="e.g., Morning Accountability"
              placeholderTextColor="#9ca3af"
              value={newGroupName}
              onChangeText={setNewGroupName}
              maxLength={60}
              autoFocus
            />
            <Pressable
              style={[s.formSubmit, (!newGroupName.trim() || submitting) && { opacity: 0.4 }]}
              onPress={handleCreate}
              disabled={!newGroupName.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={s.formSubmitText}>Create Group</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Join Form */}
        {showJoin && (
          <View style={s.inlineForm}>
            <Text style={s.formLabel}>Invite Code</Text>
            <TextInput
              style={s.formInput}
              placeholder="Paste invite code"
              placeholderTextColor="#9ca3af"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
              autoFocus
            />
            <Pressable
              style={[s.formSubmit, (!joinCode.trim() || submitting) && { opacity: 0.4 }]}
              onPress={handleJoin}
              disabled={!joinCode.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={s.formSubmitText}>Join Group</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Group List */}
        {groups.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Your Groups</Text>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                style={s.groupCard}
                onPress={() =>
                  router.push({ pathname: '/group-detail', params: { id: group.id } })
                }
              >
                <View style={s.groupIcon}>
                  <Ionicons name="people" size={20} color={C.primary} />
                </View>
                <View style={s.groupInfo}>
                  <Text style={s.groupName}>{group.name}</Text>
                  <Text style={s.groupMeta}>
                    {group.member_count} member{group.member_count !== 1 ? 's' : ''} · {formatRelative(group.last_activity)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.onSurfaceVariant} />
              </Pressable>
            ))}
          </>
        ) : (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <Ionicons name="people-outline" size={48} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>No Groups Yet</Text>
            <Text style={s.emptyText}>
              Create a group to stay accountable together, or join one with an invite code.
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

  // Actions
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  actionButtonActive: { backgroundColor: C.primary },
  actionButtonText: { fontSize: 15, fontWeight: '600', color: C.primary },

  // Inline forms
  inlineForm: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  formInput: {
    fontSize: 15,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  formSubmit: {
    backgroundColor: C.primary,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  formSubmitText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Group card
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: '600', color: C.onSurface },
  groupMeta: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 3 },

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
