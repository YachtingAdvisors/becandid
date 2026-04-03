// ============================================================
// app/referrals.tsx — Referral Dashboard
//
// Referral code display, share, stats row, and referred users
// list. Uses Clipboard and Share APIs.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
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
  error: '#ef4444',
  emerald: '#10b981',
  border: '#e5e7eb',
} as const;

// ── Types ──────────────────────────────────────────────────

type ReferralData = {
  code: string | null;
  stats: {
    invites_sent: number;
    signups: number;
    rewards: number;
  };
  referrals: ReferredUser[];
};

type ReferredUser = {
  id: string;
  display_name: string;
  signed_up_at: string;
};

// ── Helpers ────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────

export default function ReferralsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<ReferralData>({
    code: null,
    stats: { invites_sent: 0, signups: 0, rewards: 0 },
    referrals: [],
  });

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await apiClient.get<ReferralData>('/api/referrals');
      setData(res);
    } catch (e) {
      console.warn('[Referrals] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReferrals();
    setRefreshing(false);
  }, [fetchReferrals]);

  // ── Actions ──────────────────────────────────────────────

  const generateCode = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post<{ code: string }>('/api/referrals', {
        action: 'generate',
      });
      setData((prev) => ({ ...prev, code: res.code }));
    } catch (e) {
      Alert.alert('Error', 'Could not generate referral code.');
      console.warn('[Referrals] Generate error:', e);
    } finally {
      setGenerating(false);
    }
  }, []);

  const copyCode = useCallback(async () => {
    if (!data.code) return;
    await Clipboard.setStringAsync(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data.code]);

  const shareCode = useCallback(async () => {
    if (!data.code) return;
    try {
      await Share.share({
        message: `Join me on Be Candid -- the accountability app that helps you align your digital life with your values. Use my referral code: ${data.code}\n\nhttps://becandid.io/signup?ref=${data.code}`,
      });
    } catch (e) {
      // user cancelled share
    }
  }, [data.code]);

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={C.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Referrals</Text>
          <View style={{ width: 24 }} />
        </View>

        {data.code ? (
          <>
            {/* Referral Code Card */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Your Referral Code</Text>
              <Text style={styles.codeText}>{data.code}</Text>
              <View style={styles.codeActions}>
                <Pressable style={styles.codeButton} onPress={copyCode}>
                  <Ionicons
                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                    size={18}
                    color={C.primary}
                  />
                  <Text style={styles.codeButtonText}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </Pressable>
                <Pressable style={styles.shareButton} onPress={shareCode}>
                  <Ionicons name="share-outline" size={18} color="#ffffff" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </Pressable>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{data.stats.invites_sent}</Text>
                <Text style={styles.statLabel}>Invites Sent</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{data.stats.signups}</Text>
                <Text style={styles.statLabel}>Signups</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{data.stats.rewards}</Text>
                <Text style={styles.statLabel}>Rewards</Text>
              </View>
            </View>

            {/* Referred Users */}
            {data.referrals.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Referred Users</Text>
                {data.referrals.map((user) => (
                  <View key={user.id} style={styles.referralRow}>
                    <View style={styles.referralAvatar}>
                      <Ionicons name="person" size={18} color={C.primary} />
                    </View>
                    <View style={styles.referralInfo}>
                      <Text style={styles.referralName}>{user.display_name}</Text>
                      <Text style={styles.referralDate}>
                        Joined {formatDate(user.signed_up_at)}
                      </Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={C.emerald} />
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={C.border} />
                <Text style={styles.emptyText}>
                  Share your code to start earning rewards when friends sign up.
                </Text>
              </View>
            )}
          </>
        ) : (
          /* No Code — Generate */
          <View style={styles.noCodeContainer}>
            <View style={styles.noCodeIcon}>
              <Ionicons name="gift-outline" size={56} color={C.primary} />
            </View>
            <Text style={styles.noCodeTitle}>Invite Friends</Text>
            <Text style={styles.noCodeSubtitle}>
              Generate a referral code and earn rewards when your friends join Be Candid.
            </Text>
            <Pressable
              style={styles.generateButton}
              onPress={generateCode}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                  <Text style={styles.generateButtonText}>Generate Referral Code</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.onSurface,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
  },

  // ── Code Card ──────────────────────────────────────────
  codeCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 3,
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  codeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: C.primary,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },

  // ── Stats ──────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: C.onSurface,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 4,
  },

  // ── Referral List ──────────────────────────────────────
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
    gap: 12,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.onSurface,
  },
  referralDate: {
    fontSize: 13,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },

  // ── Empty State ────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },

  // ── No Code State ──────────────────────────────────────
  noCodeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCodeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noCodeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 8,
  },
  noCodeSubtitle: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
    marginBottom: 28,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    minHeight: 48,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
