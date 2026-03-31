// ============================================================
// app/conversation/[alertId].tsx — Conversation Guide Modal
//
// Shows alert details with AI-generated conversation guide
// and outcome feedback buttons.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSession } from '../../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

type AlertData = {
  id: string;
  category: string;
  severity: number;
  created_at: string;
  conversation_guide?: string;
  metadata?: Record<string, any>;
};

const OUTCOMES = [
  { key: 'positive', label: 'Positive', emoji: '\u{1F44D}', color: '#16a34a', bg: '#dcfce7' },
  { key: 'neutral', label: 'Neutral', emoji: '\u{1F91D}', color: '#ca8a04', bg: '#fef9c3' },
  { key: 'difficult', label: 'Difficult', emoji: '\u{1F494}', color: '#dc2626', bg: '#fee2e2' },
] as const;

export default function ConversationScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchAlert = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session || !alertId) return;

      const res = await fetch(`${API_URL}/api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAlertData(data);
      }
    } catch (e) {
      console.warn('[Conversation] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    fetchAlert();
  }, [fetchAlert]);

  const handleOutcome = useCallback(
    async (outcome: string) => {
      if (submitting || submitted) return;

      setSubmitting(true);
      try {
        const session = await getSession();
        if (!session) return;

        const res = await fetch(`${API_URL}/api/conversations`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alertId,
            outcome,
          }),
        });

        if (res.ok) {
          setSubmitted(true);
          setTimeout(() => router.back(), 1500);
        } else {
          Alert.alert('Error', 'Failed to submit feedback.');
        }
      } catch (e) {
        Alert.alert('Error', 'Something went wrong.');
        console.warn('[Conversation] Submit error:', e);
      } finally {
        setSubmitting(false);
      }
    },
    [alertId, submitting, submitted, router]
  );

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getSeverityInfo = (severity: number) => {
    if (severity <= 3) return { label: 'Low', color: '#16a34a', bg: '#dcfce7' };
    if (severity <= 6) return { label: 'Medium', color: '#ca8a04', bg: '#fef9c3' };
    return { label: 'High', color: '#dc2626', bg: '#fee2e2' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#226779" />
      </SafeAreaView>
    );
  }

  if (!alertData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
        <Text style={styles.errorText}>Alert not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const sev = getSeverityInfo(alertData.severity);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </Pressable>
        <Text style={styles.headerTitle}>Conversation Guide</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Alert Meta */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category</Text>
            <Text style={styles.metaValue}>{alertData.category}</Text>
          </View>
          <View style={styles.metaSeparator} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Severity</Text>
            <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
              <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
            </View>
          </View>
          <View style={styles.metaSeparator} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Time</Text>
            <Text style={styles.metaValue}>{formatDateTime(alertData.created_at)}</Text>
          </View>
        </View>

        {/* Conversation Guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color="#226779" />
            <Text style={styles.guideTitle}>How to approach this conversation</Text>
          </View>
          <Text style={styles.guideText}>
            {alertData.conversation_guide ??
              'Take a moment to breathe. Approach this conversation with empathy and curiosity, not judgment. Remember that vulnerability is a strength. Start by sharing how you feel, and ask open-ended questions to understand what happened.'}
          </Text>
        </View>

        {/* Outcome Section */}
        <View style={styles.outcomeSection}>
          <Text style={styles.outcomeTitle}>
            {submitted ? 'Thanks for your feedback' : 'How did it go?'}
          </Text>
          {!submitted && (
            <Text style={styles.outcomeSubtext}>
              Your feedback helps improve future guidance.
            </Text>
          )}

          {submitted ? (
            <View style={styles.submittedBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              <Text style={styles.submittedText}>Feedback submitted</Text>
            </View>
          ) : (
            <View style={styles.outcomeRow}>
              {OUTCOMES.map((o) => (
                <Pressable
                  key={o.key}
                  style={[styles.outcomeButton, { backgroundColor: o.bg }]}
                  onPress={() => handleOutcome(o.key)}
                  disabled={submitting}
                >
                  <Text style={styles.outcomeEmoji}>{o.emoji}</Text>
                  <Text style={[styles.outcomeLabel, { color: o.color }]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
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
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  backButton: {
    backgroundColor: '#226779',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  metaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  metaSeparator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#226779',
  },
  guideText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  outcomeSection: {
    alignItems: 'center',
  },
  outcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  outcomeSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outcomeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
  },
  outcomeEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  outcomeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submittedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
  },
});
