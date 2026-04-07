// ============================================================
// app/values.tsx — Values Clarification
//
// 3-step flow:
//   1. Select values (tap cards, max 7)
//   2. Rank selected values (up/down buttons)
//   3. Identify conflicts (text input per value)
// ============================================================

import { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
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

const MAX_VALUES = 7;

const ALL_VALUES = [
  'Honesty', 'Family', 'Faith', 'Health', 'Integrity',
  'Courage', 'Compassion', 'Self-Discipline', 'Loyalty',
  'Humility', 'Gratitude', 'Service', 'Growth', 'Freedom',
  'Forgiveness', 'Patience', 'Respect', 'Responsibility',
  'Authenticity', 'Generosity', 'Connection', 'Purpose',
  'Perseverance', 'Kindness',
] as const;

type Step = 'select' | 'rank' | 'conflicts';

type ValueConflict = {
  value: string;
  conflict: string;
};

export default function ValuesScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [ranked, setRanked] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<ValueConflict[]>([]);
  const [saving, setSaving] = useState(false);

  // Step 1: Toggle value selection
  const toggleValue = useCallback((value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= MAX_VALUES) {
        Alert.alert('Maximum reached', `You can select up to ${MAX_VALUES} values.`);
        return prev;
      }
      return [...prev, value];
    });
  }, []);

  // Step 2: Move value up/down in ranking
  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setRanked((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setRanked((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  // Step 3: Update conflict text
  const updateConflict = useCallback((value: string, text: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.value === value ? { ...c, conflict: text } : c)),
    );
  }, []);

  // Step transitions
  const goToRank = useCallback(() => {
    if (selected.length < 3) {
      Alert.alert('Select more values', 'Please select at least 3 values.');
      return;
    }
    setRanked(selected);
    setStep('rank');
  }, [selected]);

  const goToConflicts = useCallback(() => {
    setConflicts(ranked.map((v) => ({ value: v, conflict: '' })));
    setStep('conflicts');
  }, [ranked]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await apiClient.post('/api/values', {
        values: conflicts.map((c, i) => ({
          name: c.value,
          rank: i + 1,
          conflict: c.conflict.trim() || null,
        })),
      });
      Alert.alert('Saved', 'Your values have been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save values.');
      console.warn('[Values] Save error:', e);
    } finally {
      setSaving(false);
    }
  }, [conflicts, router]);

  const stepNumber = step === 'select' ? 1 : step === 'rank' ? 2 : 3;

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <Pressable
            onPress={() => {
              if (step === 'rank') setStep('select');
              else if (step === 'conflicts') setStep('rank');
              else router.back();
            }}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={24} color={C.onSurface} />
          </Pressable>
          <Text style={s.headerTitle}>Values Clarification</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Step Indicator */}
        <View style={s.stepRow}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={s.stepItem}>
              <View style={[s.stepDot, n <= stepNumber && s.stepDotActive]}>
                <Text style={[s.stepDotText, n <= stepNumber && s.stepDotTextActive]}>
                  {n}
                </Text>
              </View>
              <Text style={[s.stepLabel, n === stepNumber && { color: C.primary, fontWeight: '600' }]}>
                {n === 1 ? 'Select' : n === 2 ? 'Rank' : 'Conflicts'}
              </Text>
            </View>
          ))}
        </View>

        {/* Step 1: Select */}
        {step === 'select' && (
          <>
            <Text style={s.instruction}>
              Choose up to {MAX_VALUES} values that matter most to you.
            </Text>
            <View style={s.valuesGrid}>
              {ALL_VALUES.map((value) => {
                const isSelected = selected.includes(value);
                return (
                  <Pressable
                    key={value}
                    style={[s.valueCard, isSelected && s.valueCardSelected]}
                    onPress={() => toggleValue(value)}
                  >
                    {isSelected && (
                      <View style={s.valueCheck}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                    <Text style={[s.valueCardText, isSelected && s.valueCardTextSelected]}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={s.selectionCount}>
              {selected.length} / {MAX_VALUES} selected
            </Text>
            <Pressable
              style={[s.nextButton, selected.length < 3 && { opacity: 0.4 }]}
              onPress={goToRank}
              disabled={selected.length < 3}
            >
              <Text style={s.nextButtonText}>Next: Rank Values</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>
          </>
        )}

        {/* Step 2: Rank */}
        {step === 'rank' && (
          <>
            <Text style={s.instruction}>
              Arrange your values in order of importance. Most important first.
            </Text>
            {ranked.map((value, idx) => (
              <View key={value} style={s.rankRow}>
                <View style={s.rankNumber}>
                  <Text style={s.rankNumberText}>{idx + 1}</Text>
                </View>
                <Text style={s.rankValue}>{value}</Text>
                <View style={s.rankButtons}>
                  <Pressable
                    style={[s.rankArrow, idx === 0 && { opacity: 0.2 }]}
                    onPress={() => moveUp(idx)}
                    disabled={idx === 0}
                    hitSlop={8}
                  >
                    <Ionicons name="chevron-up" size={20} color={C.primary} />
                  </Pressable>
                  <Pressable
                    style={[s.rankArrow, idx === ranked.length - 1 && { opacity: 0.2 }]}
                    onPress={() => moveDown(idx)}
                    disabled={idx === ranked.length - 1}
                    hitSlop={8}
                  >
                    <Ionicons name="chevron-down" size={20} color={C.primary} />
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable style={s.nextButton} onPress={goToConflicts}>
              <Text style={s.nextButtonText}>Next: Identify Conflicts</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>
          </>
        )}

        {/* Step 3: Conflicts */}
        {step === 'conflicts' && (
          <>
            <Text style={s.instruction}>
              For each value, describe any area where your current behavior conflicts with this value.
            </Text>
            {conflicts.map((c, idx) => (
              <View key={c.value} style={s.conflictCard}>
                <View style={s.conflictHeader}>
                  <View style={s.rankNumber}>
                    <Text style={s.rankNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={s.conflictValue}>{c.value}</Text>
                </View>
                <TextInput
                  style={s.conflictInput}
                  placeholder="Where does this value feel misaligned?"
                  placeholderTextColor="#9ca3af"
                  value={c.conflict}
                  onChangeText={(text) => updateConflict(c.value, text)}
                  multiline
                  maxLength={500}
                />
              </View>
            ))}
            <Pressable
              style={[s.saveButton, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                  <Text style={s.saveButtonText}>Save Values</Text>
                </>
              )}
            </Pressable>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  container: { flex: 1 },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },

  // Step indicator
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 24 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: C.primary },
  stepDotText: { fontSize: 13, fontWeight: '700', color: C.onSurfaceVariant },
  stepDotTextActive: { color: '#ffffff' },
  stepLabel: { fontSize: 12, color: C.onSurfaceVariant },

  instruction: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Step 1: Grid
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  valueCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  valueCardSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  valueCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueCardText: { fontSize: 14, color: C.onSurface, fontWeight: '500' },
  valueCardTextSelected: { color: C.primary, fontWeight: '600' },
  selectionCount: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },

  // Next button
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 9999,
    minHeight: 48,
  },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Step 2: Rank
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  rankNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumberText: { fontSize: 13, fontWeight: '700', color: C.primary },
  rankValue: { flex: 1, fontSize: 16, fontWeight: '600', color: C.onSurface },
  rankButtons: { flexDirection: 'column', gap: 2 },
  rankArrow: {
    width: 30,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Step 3: Conflicts
  conflictCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  conflictHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  conflictValue: { fontSize: 16, fontWeight: '600', color: C.onSurface },
  conflictInput: {
    fontSize: 14,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    lineHeight: 20,
  },

  // Save button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.emerald,
    paddingVertical: 14,
    borderRadius: 9999,
    minHeight: 48,
    marginTop: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
