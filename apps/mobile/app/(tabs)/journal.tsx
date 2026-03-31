// ============================================================
// app/(tabs)/journal.tsx — Candid Journal Screen
//
// FlatList of journal entries with write mode. Uses Supabase
// directly for CRUD on the stringer_journal table.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase, getUser } from '../../src/lib/supabase';

const MOODS = [
  { label: 'Great', emoji: '\u{1F60A}' },
  { label: 'Good', emoji: '\u{1F642}' },
  { label: 'Okay', emoji: '\u{1F610}' },
  { label: 'Struggling', emoji: '\u{1F61F}' },
  { label: 'Crisis', emoji: '\u{1F198}' },
] as const;

const PROMPTS = [
  {
    key: 'tributaries',
    title: 'Trace the Tributaries',
    placeholder: 'What feelings or events led to where you are right now?',
  },
  {
    key: 'longing',
    title: 'Name the Longing',
    placeholder: 'What is it you truly want or need beneath the surface?',
  },
  {
    key: 'roadmap',
    title: 'Follow the Roadmap',
    placeholder: 'What is one small step you can take forward from here?',
  },
] as const;

type JournalEntry = {
  id: string;
  created_at: string;
  mood?: string;
  content?: string;
  guided_responses?: Record<string, string>;
  tags?: string[];
};

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [writeMode, setWriteMode] = useState(false);

  // Write mode state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [freewrite, setFreewrite] = useState('');
  const [guidedResponses, setGuidedResponses] = useState<Record<string, string>>({});
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const user = await getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('stringer_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[Journal] Fetch error:', error.message);
        return;
      }

      setEntries(data ?? []);
    } catch (e) {
      console.warn('[Journal] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, [fetchEntries]);

  const handleSave = useCallback(async () => {
    if (!freewrite.trim() && Object.values(guidedResponses).every((v) => !v.trim())) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setSaving(true);
    try {
      const user = await getUser();
      if (!user) {
        Alert.alert('Error', 'You must be signed in to save entries.');
        return;
      }

      const moodLabel = selectedMood !== null ? MOODS[selectedMood].label : undefined;
      const content = freewrite.trim();
      const guided = Object.fromEntries(
        Object.entries(guidedResponses).filter(([, v]) => v.trim())
      );

      const { error } = await supabase.from('stringer_journal').insert({
        user_id: user.id,
        mood: moodLabel,
        content,
        guided_responses: Object.keys(guided).length > 0 ? guided : undefined,
      });

      if (error) {
        Alert.alert('Error', 'Failed to save entry. Please try again.');
        console.warn('[Journal] Save error:', error.message);
        return;
      }

      // Reset write mode
      setFreewrite('');
      setGuidedResponses({});
      setSelectedMood(null);
      setExpandedPrompt(null);
      setWriteMode(false);
      await fetchEntries();
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
      console.warn('[Journal] Save error:', e);
    } finally {
      setSaving(false);
    }
  }, [freewrite, guidedResponses, selectedMood, fetchEntries]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (mood?: string) => {
    const found = MOODS.find((m) => m.label === mood);
    return found?.emoji ?? '';
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.created_at)}</Text>
        {item.mood && <Text style={styles.entryMood}>{getMoodEmoji(item.mood)}</Text>}
      </View>
      {item.content ? (
        <Text style={styles.entryContent} numberOfLines={2}>
          {item.content}
        </Text>
      ) : null}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={48} color="#9ca3af" />
      <Text style={styles.emptyTitle}>Start your first entry</Text>
      <Text style={styles.emptySubtext}>
        Your journal is a private space to reflect and grow.
      </Text>
      <Pressable style={styles.emptyCta} onPress={() => setWriteMode(true)}>
        <Text style={styles.emptyCtaText}>Write Now</Text>
      </Pressable>
    </View>
  );

  // Write mode modal
  const renderWriteModal = () => (
    <Modal visible={writeMode} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.writeContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Write Header */}
          <View style={styles.writeHeader}>
            <Pressable onPress={() => setWriteMode(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.writeTitle}>New Entry</Text>
            <Pressable onPress={handleSave} disabled={saving}>
              <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.writeBody} keyboardShouldPersistTaps="handled">
            {/* Mood Selector */}
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((mood, i) => (
                <Pressable
                  key={mood.label}
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

            {/* Guided Prompts */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Guided Prompts</Text>
            {PROMPTS.map((prompt) => (
              <View key={prompt.key} style={styles.promptSection}>
                <Pressable
                  style={styles.promptHeader}
                  onPress={() =>
                    setExpandedPrompt(expandedPrompt === prompt.key ? null : prompt.key)
                  }
                >
                  <Text style={styles.promptTitle}>{prompt.title}</Text>
                  <Ionicons
                    name={expandedPrompt === prompt.key ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>
                {expandedPrompt === prompt.key && (
                  <TextInput
                    style={styles.promptInput}
                    placeholder={prompt.placeholder}
                    placeholderTextColor="#9ca3af"
                    multiline
                    value={guidedResponses[prompt.key] ?? ''}
                    onChangeText={(text) =>
                      setGuidedResponses((prev) => ({ ...prev, [prompt.key]: text }))
                    }
                  />
                )}
              </View>
            ))}

            {/* Freewrite */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Freewrite</Text>
            <TextInput
              style={styles.freewriteInput}
              placeholder="Write freely here..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              value={freewrite}
              onChangeText={setFreewrite}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
        <Text style={styles.headerTitle}>Candid Journal</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#226779" />
        }
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setWriteMode(true)}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>

      {renderWriteModal()}
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  entryMood: {
    fontSize: 20,
  },
  entryContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#226779',
    fontWeight: '500',
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
    paddingHorizontal: 40,
  },
  emptyCta: {
    backgroundColor: '#226779',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  emptyCtaText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#226779',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  // Write Modal Styles
  writeContainer: {
    flex: 1,
    backgroundColor: '#fbf9f8',
  },
  writeHeader: {
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
  writeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#226779',
  },
  writeBody: {
    flex: 1,
    padding: 20,
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
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    minWidth: 58,
  },
  moodButtonSelected: {
    backgroundColor: '#e0f2f1',
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  promptSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  promptInput: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  freewriteInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 40,
  },
});
