import { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

interface ReachOutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReachOutModal({ visible, onClose }: ReachOutModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${API_URL}/api/reach-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage('');
        onClose();
      }, 2000);
    } catch {
      // Silent fail
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {sent ? (
            <View style={styles.sentContainer}>
              <Text style={styles.sentEmoji}>✓</Text>
              <Text style={styles.sentText}>Your partner has been notified</Text>
            </View>
          ) : (
            <>
              <Text style={styles.emoji}>🤝</Text>
              <Text style={styles.title}>Reach Out</Text>
              <Text style={styles.subtitle}>Send a quick message to your partner</Text>

              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="I could use someone to talk to right now..."
                placeholderTextColor="#b1b2b2"
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length}/200</Text>

              <View style={styles.buttons}>
                <Pressable style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.sendText}>Send</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fbf9f8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#313333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#5e5f5f',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#eeeeed',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#313333',
    minHeight: 80,
    maxHeight: 120,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: '#b1b2b2',
    marginTop: 4,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#eeeeed',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5e5f5f',
  },
  sendBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#226779',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0fbff',
  },
  sentContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  sentEmoji: {
    fontSize: 40,
    color: '#34c759',
    marginBottom: 12,
  },
  sentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#313333',
  },
});
