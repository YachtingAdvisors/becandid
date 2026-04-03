// ============================================================
// app/(tabs)/settings.tsx — Settings Screen
//
// Profile editing, monitoring toggle, goals, check-in config,
// partner info, and sign-out.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase, getSession } from '../../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

// Brand colors
const C = {
  primary: '#226779',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  emerald: '#10b981',
  border: '#e5e7eb',
} as const;

const STREAK_MODES = [
  {
    key: 'spartan',
    title: 'Spartan Mode',
    description: 'Zero tolerance. Any flagged event breaks your streak.',
    icon: 'shield-outline' as const,
  },
  {
    key: 'accountable',
    title: 'Accountable Mode',
    description: 'Focus on honesty. Self-reported events are learning moments, not failures.',
    icon: 'people-outline' as const,
  },
] as const;

type Profile = {
  display_name?: string;
  email?: string;
  phone?: string;
  monitoring_enabled?: boolean;
  vpn_filter_enabled?: boolean;
  streak_mode?: string;
  notification_digests?: boolean;
  notification_partner_alerts?: boolean;
  notification_check_ins?: boolean;
  goals?: string[];
  check_in_time?: string;
  check_in_frequency?: string;
  partner_name?: string;
  partner_status?: string;
  partner_email?: string;
};

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({});

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [vpnFilterEnabled, setVpnFilterEnabled] = useState(false);
  const [streakMode, setStreakMode] = useState<string>('accountable');
  const [notifyDigests, setNotifyDigests] = useState(true);
  const [notifyPartnerAlerts, setNotifyPartnerAlerts] = useState(true);
  const [notifyCheckIns, setNotifyCheckIns] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setDisplayName(data.display_name ?? '');
        setPhone(data.phone ?? '');
        setMonitoringEnabled(data.monitoring_enabled ?? false);
        setVpnFilterEnabled(data.vpn_filter_enabled ?? false);
        setStreakMode(data.streak_mode ?? 'accountable');
        setNotifyDigests(data.notification_digests ?? true);
        setNotifyPartnerAlerts(data.notification_partner_alerts ?? true);
        setNotifyCheckIns(data.notification_check_ins ?? true);
      }
    } catch (e) {
      console.warn('[Settings] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          phone: phone.trim(),
          monitoring_enabled: monitoringEnabled,
          vpn_filter_enabled: vpnFilterEnabled,
          streak_mode: streakMode,
          notification_digests: notifyDigests,
          notification_partner_alerts: notifyPartnerAlerts,
          notification_check_ins: notifyCheckIns,
        }),
      });

      if (res.ok) {
        Alert.alert('Saved', 'Your settings have been updated.');
      } else {
        Alert.alert('Error', 'Failed to save settings.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
      console.warn('[Settings] Save error:', e);
    } finally {
      setSaving(false);
    }
  }, [displayName, phone, monitoringEnabled, vpnFilterEnabled, streakMode, notifyDigests, notifyPartnerAlerts, notifyCheckIns]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/auth/signin');
        },
      },
    ]);
  }, [router]);

  const handleMonitoringToggle = useCallback(
    (value: boolean) => {
      if (!value) {
        Alert.alert(
          'Disable Monitoring',
          'Your partner will be notified that monitoring has been turned off.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: () => setMonitoringEnabled(false),
            },
          ]
        );
      } else {
        setMonitoringEnabled(true);
      }
    },
    []
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#226779" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValueReadonly}>{profile.email ?? 'Not set'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Your phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Monitoring */}
        <Text style={styles.sectionTitle}>Monitoring</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Awareness Monitoring</Text>
              <Text style={styles.toggleSubtext}>
                {monitoringEnabled
                  ? 'Your partner can see your activity'
                  : 'Monitoring is off'}
              </Text>
            </View>
            <Switch
              value={monitoringEnabled}
              onValueChange={handleMonitoringToggle}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={monitoringEnabled ? '#16a34a' : '#f4f4f5'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
          {!monitoringEnabled && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={16} color="#dc2626" />
              <Text style={styles.warningText}>
                Your partner will be notified if you disable monitoring.
              </Text>
            </View>
          )}
        </View>

        {/* VPN Filter */}
        <Text style={styles.sectionTitle}>Content Filter</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.toggleLabelRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={C.primary} />
                <Text style={styles.fieldLabel}>VPN Content Filter</Text>
              </View>
              <Text style={styles.toggleSubtext}>
                {vpnFilterEnabled
                  ? 'DNS-level blocking is active on this device'
                  : 'Enable to block harmful content at the network level'}
              </Text>
            </View>
            <Switch
              value={vpnFilterEnabled}
              onValueChange={setVpnFilterEnabled}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={vpnFilterEnabled ? '#16a34a' : '#f4f4f5'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
        </View>

        {/* Streak Mode */}
        <Text style={styles.sectionTitle}>Streak Mode</Text>
        <View style={styles.card}>
          {STREAK_MODES.map((mode, i) => (
            <View key={mode.key}>
              {i > 0 && <View style={styles.separator} />}
              <Pressable
                style={styles.streakModeRow}
                onPress={() => setStreakMode(mode.key)}
              >
                <View style={styles.streakModeLeft}>
                  <View style={[styles.streakModeIcon, streakMode === mode.key && styles.streakModeIconActive]}>
                    <Ionicons
                      name={mode.icon}
                      size={18}
                      color={streakMode === mode.key ? C.primary : C.onSurfaceVariant}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.streakModeTitle}>{mode.title}</Text>
                    <Text style={styles.streakModeDesc}>{mode.description}</Text>
                  </View>
                </View>
                <View style={[styles.radio, streakMode === mode.key && styles.radioSelected]}>
                  {streakMode === mode.key && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Notification Preferences */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>Weekly Digests</Text>
            <Switch
              value={notifyDigests}
              onValueChange={setNotifyDigests}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={notifyDigests ? '#16a34a' : '#f4f4f5'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>Partner Alerts</Text>
            <Switch
              value={notifyPartnerAlerts}
              onValueChange={setNotifyPartnerAlerts}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={notifyPartnerAlerts ? '#16a34a' : '#f4f4f5'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>Check-in Reminders</Text>
            <Switch
              value={notifyCheckIns}
              onValueChange={setNotifyCheckIns}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={notifyCheckIns ? '#16a34a' : '#f4f4f5'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
        </View>

        {/* Goals / Rivals */}
        <Text style={styles.sectionTitle}>Goals / Focus Areas</Text>
        <View style={styles.card}>
          {profile.goals && profile.goals.length > 0 ? (
            <View style={styles.goalsRow}>
              {profile.goals.map((goal: string) => (
                <View key={goal} style={styles.goalChip}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyField}>No focus areas selected</Text>
          )}
          <Pressable style={styles.editLink}>
            <Text style={styles.editLinkText}>Edit Focus Areas</Text>
            <Ionicons name="chevron-forward" size={16} color={C.primary} />
          </Pressable>
        </View>

        {/* Check-in Config */}
        <Text style={styles.sectionTitle}>Check-ins</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Time</Text>
            <Text style={styles.fieldValue}>
              {profile.check_in_time ?? '9:00 AM'}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Frequency</Text>
            <Text style={styles.fieldValue}>
              {profile.check_in_frequency ?? 'Daily'}
            </Text>
          </View>
        </View>

        {/* Partner Section */}
        <Text style={styles.sectionTitle}>Partner</Text>
        <View style={styles.card}>
          {profile.partner_name ? (
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Ionicons name="person" size={20} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>{profile.partner_name}</Text>
                <View
                  style={[
                    styles.partnerStatusBadge,
                    {
                      backgroundColor:
                        profile.partner_status === 'active' ? '#dcfce7' : '#fef3c7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.partnerStatusText,
                      {
                        color:
                          profile.partner_status === 'active' ? '#16a34a' : '#ca8a04',
                      },
                    ]}
                  >
                    {profile.partner_status === 'active' ? 'Connected' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Pressable style={styles.inviteButton}>
              <Ionicons name="person-add-outline" size={20} color={C.primary} />
              <Text style={styles.inviteText}>Invite Partner</Text>
            </Pressable>
          )}
          {/* Invite another partner link */}
          {profile.partner_name && (
            <>
              <View style={styles.separator} />
              <Pressable style={styles.editLink}>
                <Text style={styles.editLinkText}>Invite Another Partner</Text>
                <Ionicons name="chevron-forward" size={16} color={C.primary} />
              </Pressable>
            </>
          )}
        </View>

        {/* More Features */}
        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.card}>
          <Pressable style={styles.editLink} onPress={() => router.push('/fasting')}>
            <View style={styles.toggleLabelRow}>
              <Ionicons name="leaf-outline" size={18} color={C.primary} />
              <Text style={styles.editLinkText}>Digital Fasting</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.primary} />
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.editLink} onPress={() => router.push('/referrals')}>
            <View style={styles.toggleLabelRow}>
              <Ionicons name="gift-outline" size={18} color={C.primary} />
              <Text style={styles.editLinkText}>Referrals</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.primary} />
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.editLink} onPress={() => router.push('/reflections')}>
            <View style={styles.toggleLabelRow}>
              <Ionicons name="journal-outline" size={18} color={C.primary} />
              <Text style={styles.editLinkText}>Weekly Reflections</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.primary} />
          </Pressable>
        </View>

        {/* Sign Out */}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={C.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#226779',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 0,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  fieldInput: {
    fontSize: 15,
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  fieldValue: {
    fontSize: 15,
    color: '#6b7280',
  },
  fieldValueReadonly: {
    fontSize: 15,
    color: '#9ca3af',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toggleSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#dc2626',
    flex: 1,
  },
  goalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  goalChip: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalText: {
    fontSize: 13,
    color: '#226779',
    fontWeight: '500',
  },
  emptyField: {
    fontSize: 14,
    color: '#9ca3af',
    padding: 16,
    paddingBottom: 8,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  editLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#226779',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  partnerStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  partnerStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  inviteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#226779',
  },
  // Toggle label with icon
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  // Streak mode
  streakModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  streakModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  streakModeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakModeIconActive: {
    backgroundColor: '#e0f2f1',
  },
  streakModeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.onSurface,
  },
  streakModeDesc: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: C.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.error,
  },
});
