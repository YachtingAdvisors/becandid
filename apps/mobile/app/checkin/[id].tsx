// ============================================================
// app/checkin/[id].tsx — Check-in Responder Modal
//
// Fetches a check-in prompt and lets the user respond with
// mood + text, then submits via PATCH.
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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSession } from '../../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

const MOODS = [
  { label: 'Great', emoji: '\u{1F60A}', value: 'great' },
  { label: 'Good', emoji: '\u{1F642}', value: 'good' },
  { label: 'Okay', emoji: '\u{1F610}', value: 'okay' },
  { label: 'Struggling', emoji: '\u{1F61F}', value: 'struggling' },
  { label: 'Crisis', emoji: '\u{1F198}', value: 'crisis' },
] as const;

type CheckIn = {
  id: string;
  prompt: string;
  status: string;
  created_at: string;
};

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchCheckIn = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session || !id) return;

      const res = await fetch(`${API_URL}/api/check-ins/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCheckIn(data);
      }
    } catch (e) {
      console.warn('[CheckIn] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCheckIn();
  }, [fetchCheckIn]);

  const handleSubmit = useCallback(async () => {
    if (selectedMood === null) {
      Alert.alert('Select Mood', 'Please select how you are feeling.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/check-ins/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: MOODS[selectedMood].value,
          response: response.trim() || undefined,
          status: 'completed',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => router.back(), 1500);
      } else {
        Alert.alert('Error', 'Failed to submit check-in.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
      console.warn('[CheckIn] Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [id, selectedMood, response, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#226779" />
      </SafeAreaView>
    );
  }

  if (!checkIn) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
        <Text style={styles.errorText}>Check-in not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </Pressable>
        <Text style={styles.headerTitle}>Check-in</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {submitted ? (
            <View style={styles.submittedState}>
              <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
              <Text style={styles.submittedTitle}>Check-in Complete</Text>
              <Text style={styles.submittedSubtext}>
                Thank you for being candid. Keep going.
              </Text>
            </View>
          ) : (
            <>
              {/* Prompt */}
              <View style={styles.promptCard}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#226779" />
                <Text style={styles.promptText}>
                  {checkIn.prompt ?? 'How are you doing right now?'}
                </Text>
              </View>

              {/* Mood Selector */}
              <Text style={styles.sectionLabel}>How are you feeling?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((mood, i) => (
                  <Pressable
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      selectedMood === i && styles.moodButtonSelected,
                    ]}
                    onPress={() => setSelectedMood(i)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Response */}
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                Your response (optional)
              </Text>
              <TextInput
                style={styles.responseInput}
                placeholder="Share what's on your mind..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={response}
                onChangeText={setResponse}
              />

              {/* Submit */}
              <Pressable
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitText}>
                  {submitting ? 'Submitting...' : 'Submit Check-in'}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  promptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 26,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  moodButtonSelected: {
    backgroundColor: '#e0f2f1',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  responseInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#226779',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  submittedState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  submittedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  submittedSubtext: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
});
