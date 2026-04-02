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
    subtitle: 'The Stringer Framework',
    placeholder: 'What feelings or events led to where you are right now?',
    icon: 'water-outline' as const,
  },
  {
    key: 'longing',
    title: 'Name the Longing',
    subtitle: 'Beneath the surface',
    placeholder: 'What is it you truly want or need beneath the surface?',
    icon: 'heart-outline' as const,
  },
  {
    key: 'roadmap',
    title: 'Follow the Roadmap',
    subtitle: 'One step forward',
    placeholder: 'What is one small step you can take forward from here?',
    icon: 'map-outline' as const,
  },
] as const;

const TAGS = [
  'temptation', 'victory', 'trigger', 'grateful', 'lonely',
  'stressed', 'hopeful', 'accountable', 'relapse', 'growth',
] as const;

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
        tags: selectedTags.length > 0 ? selectedTags : undefined,
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
      setSelectedTags([]);
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

            {/* Guided Prompts (Stringer Framework) */}
            <View style={styles.sectionLabelRow}>
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Stringer Framework</Text>
              <Text style={styles.sectionHint}>Tap to expand</Text>
            </View>
            {PROMPTS.map((prompt) => {
              const isExpanded = expandedPrompt === prompt.key;
              const hasContent = !!(guidedResponses[prompt.key]?.trim());
              return (
                <View key={prompt.key} style={[styles.promptSection, isExpanded && styles.promptSectionExpanded]}>
                  <Pressable
                    style={styles.promptHeader}
                    onPress={() =>
                      setExpandedPrompt(isExpanded ? null : prompt.key)
                    }
                  >
                    <View style={styles.promptHeaderLeft}>
                      <Ionicons
                        name={prompt.icon}
                        size={18}
                        color={isExpanded ? C.primary : C.onSurfaceVariant}
                      />
                      <View>
                        <Text style={[styles.promptTitle, isExpanded && styles.promptTitleActive]}>
                          {prompt.title}
                        </Text>
                        <Text style={styles.promptSubtitle}>{prompt.subtitle}</Text>
                      </View>
                    </View>
                    <View style={styles.promptHeaderRight}>
                      {hasContent && !isExpanded && (
                        <Ionicons name="checkmark-circle" size={16} color={C.emerald} />
                      )}
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={C.onSurfaceVariant}
                      />
                    </View>
                  </Pressable>
                  {isExpanded && (
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
              );
            })}

            {/* Tags */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Tags</Text>
            <View style={styles.tagsSelector}>
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                    onPress={() => {
                      setSelectedTags((prev) =>
                        isSelected
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

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
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 10,
    marginTop: 20,
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
    backgroundColor: C.surface,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  promptSectionExpanded: {
    borderColor: C.primary,
    borderWidth: 1.5,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  promptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  promptHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  promptTitleActive: {
    color: C.primary,
    fontWeight: '600',
  },
  promptSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
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
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 15,
    color: C.onSurface,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 40,
  },
  // Tag selector
  tagsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagChipSelected: {
    backgroundColor: '#e0f2f1',
    borderColor: C.primary,
  },
  tagChipText: {
    fontSize: 13,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: C.primary,
    fontWeight: '600',
  },
});
