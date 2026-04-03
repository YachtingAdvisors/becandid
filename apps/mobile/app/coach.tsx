// ============================================================
// app/coach.tsx — Conversation Coach (Modal Screen)
//
// Full-screen modal for the streaming Conversation Coach.
// Uses the Stringer framework (Tributaries → Longing → Roadmap)
// to guide users through processing what happened.
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSession } from '../src/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

// Brand colors
const C = {
  primary: '#226779',
  primaryLight: '#e0f2f1',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  border: '#e5e7eb',
  coachBubble: '#f3f4f6',
  userBubble: '#226779',
} as const;

const PHASES = ['Tributaries', 'Longing', 'Roadmap'] as const;
type Phase = (typeof PHASES)[number];

type Message = {
  id: string;
  role: 'user' | 'coach';
  text: string;
  timestamp: number;
};

export default function CoachScreen() {
  const router = useRouter();
  const { alertId } = useLocalSearchParams<{ alertId?: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<Phase>('Tributaries');
  const [sessionEnded, setSessionEnded] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<RNTextInput>(null);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Pulse animation for the streaming indicator
  useEffect(() => {
    if (!streaming) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [streaming]);

  // Show empty state / initial coach message
  useEffect(() => {
    const greeting: Message = {
      id: 'welcome',
      role: 'coach',
      text: 'Your coach is here to help you understand what just happened \u2014 with curiosity, not judgment.\n\nWhen you\u2019re ready, tell me what was happening before the moment you want to explore.',
      timestamp: Date.now(),
    };
    setMessages([greeting]);
  }, []);

  const phaseIndex = PHASES.indexOf(phase);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Stream a response from the coach API
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming || sessionEnded) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    scrollToEnd();

    const coachMsgId = `coach-${Date.now()}`;
    // Add placeholder for streaming
    setMessages((prev) => [
      ...prev,
      { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() },
    ]);

    try {
      const session = await getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/api/coach`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          phase,
          alertId: alertId || undefined,
          history: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text })),
        }),
      });

      if (!res.ok) throw new Error(`Coach API returned ${res.status}`);

      // Stream the response using the body reader
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the coach message in real time
          setMessages((prev) =>
            prev.map((m) =>
              m.id === coachMsgId ? { ...m, text: accumulated } : m,
            ),
          );
          scrollToEnd();
        }
      } else {
        // Fallback: non-streaming response
        const data = await res.json();
        accumulated = data.message || data.text || data.content || '';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === coachMsgId ? { ...m, text: accumulated } : m,
          ),
        );
      }

      // Detect phase transitions from the response
      if (accumulated.toLowerCase().includes('what did you actually need') ||
          accumulated.toLowerCase().includes('unmet longing')) {
        setPhase('Longing');
      } else if (accumulated.toLowerCase().includes('roadmap') ||
                 accumulated.toLowerCase().includes('who you want to become')) {
        setPhase('Roadmap');
      }
    } catch (err) {
      console.warn('[Coach] Stream error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === coachMsgId
            ? { ...m, text: 'I\u2019m having trouble connecting right now. Please try again in a moment.' }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      scrollToEnd();
    }
  }, [input, streaming, sessionEnded, phase, alertId, messages, scrollToEnd]);

  const handleEndSession = useCallback(() => {
    setSessionEnded(true);
    const endMsg: Message = {
      id: `end-${Date.now()}`,
      role: 'coach',
      text: 'Thank you for being candid today. Remember: awareness is the first step toward the life you actually want. You can come back anytime.',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, endMsg]);
    scrollToEnd();
  }, [scrollToEnd]);

  // ── Render helpers ──────────────────────────────────────────

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === 'user';

      return (
        <View
          style={[
            styles.messageBubbleRow,
            isUser ? styles.messageBubbleRowUser : styles.messageBubbleRowCoach,
          ]}
        >
          {/* Coach avatar */}
          {!isUser && (
            <View style={styles.coachAvatar}>
              <Ionicons name="heart" size={16} color="#ffffff" />
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              isUser ? styles.messageBubbleUser : styles.messageBubbleCoach,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.messageTextUser : styles.messageTextCoach,
              ]}
            >
              {item.text}
            </Text>
          </View>
        </View>
      );
    },
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerCloseBtn}
        >
          <Ionicons name="close" size={24} color={C.onSurface} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Conversation Coach</Text>

          {/* Phase breadcrumbs */}
          <View style={styles.phaseDots}>
            {PHASES.map((p, i) => (
              <View key={p} style={styles.phaseItem}>
                <View
                  style={[
                    styles.phaseDot,
                    i <= phaseIndex
                      ? styles.phaseDotActive
                      : styles.phaseDotInactive,
                    i === phaseIndex && styles.phaseDotCurrent,
                  ]}
                />
                <Text
                  style={[
                    styles.phaseLabel,
                    i === phaseIndex && styles.phaseLabelActive,
                  ]}
                >
                  {p}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!sessionEnded ? (
          <TouchableOpacity
            onPress={handleEndSession}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.endSessionText}>End</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Chat messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToEnd()}
        />

        {/* Streaming indicator */}
        {streaming && (
          <Animated.View style={[styles.streamingIndicator, { opacity: pulseAnim }]}>
            <View style={styles.coachAvatarSmall}>
              <Ionicons name="heart" size={10} color="#ffffff" />
            </View>
            <Text style={styles.streamingText}>Coach is typing...</Text>
          </Animated.View>
        )}

        {/* Input bar */}
        {!sessionEnded ? (
          <View style={styles.inputBar}>
            <RNTextInput
              ref={inputRef}
              style={styles.inputField}
              value={input}
              onChangeText={setInput}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={2000}
              editable={!streaming}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || streaming) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || streaming}
            >
              {streaming ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="send" size={18} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.endedBar}>
            <TouchableOpacity
              style={styles.endedButton}
              onPress={() => router.back()}
            >
              <Text style={styles.endedButtonText}>Close Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 6,
  },
  endSessionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    paddingHorizontal: 4,
  },

  // Phase breadcrumbs
  phaseDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseDotActive: {
    backgroundColor: C.primary,
  },
  phaseDotInactive: {
    backgroundColor: '#d1d5db',
  },
  phaseDotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: C.onSurfaceVariant,
  },
  phaseLabelActive: {
    color: C.primary,
    fontWeight: '700',
  },

  // Messages
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageBubbleRowUser: {
    alignSelf: 'flex-end',
  },
  messageBubbleRowCoach: {
    alignSelf: 'flex-start',
  },
  coachAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  messageBubbleUser: {
    backgroundColor: C.userBubble,
    borderBottomRightRadius: 4,
  },
  messageBubbleCoach: {
    backgroundColor: C.coachBubble,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextCoach: {
    color: C.onSurface,
  },

  // Streaming indicator
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 6,
  },
  coachAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamingText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: C.onSurface,
    maxHeight: 120,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },

  // Session ended
  endedBar: {
    padding: 16,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  endedButton: {
    backgroundColor: C.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  endedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
