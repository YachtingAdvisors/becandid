// ============================================================
// apps/mobile/app/auth/signup.tsx
//
// Sign-up screen for Be Candid. Matches the sign-in screen's
// clean iOS-native style. Includes real-time password strength.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

// ── Design tokens ───────────────────────────────────────────

const colors = {
  primary: '#226779',
  bg: '#fbf9f8',
  error: '#a83836',
  text: '#313333',
  muted: '#5e5f5f',
  border: '#d4d4d4',
  white: '#ffffff',
};

// ── Password strength ───────────────────────────────────────

type StrengthLevel = 'Weak' | 'Fair' | 'Good' | 'Strong';

const strengthColors: Record<StrengthLevel, string> = {
  Weak: '#d93025',
  Fair: '#e37400',
  Good: '#f5b400',
  Strong: '#1e8e3e',
};

function getPasswordStrength(pw: string): { level: StrengthLevel; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;

  const levels: StrengthLevel[] = ['Weak', 'Fair', 'Good', 'Strong'];
  const level = levels[Math.min(score, 4) - 1] || 'Weak';

  return { level, score };
}

// ── Component ───────────────────────────────────────────────

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSignUp = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (strength.level === 'Weak') {
      setError('Password is too weak. Include uppercase, lowercase, and a number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || loading;
  const submitDisabled = isLoading || strength.level === 'Weak';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Be Candid</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor:
                          i < strength.score
                            ? strengthColors[strength.level]
                            : '#e0e0e0',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.strengthLabel,
                  { color: strengthColors[strength.level] },
                ]}
              >
                {strength.level}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
            onSubmitEditing={handleSignUp}
            returnKeyType="go"
          />

          <TouchableOpacity
            style={[styles.button, submitDisabled && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={submitDisabled}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signin')}
            disabled={isLoading}
          >
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 6,
  },

  // Form
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },

  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 48,
    textAlign: 'right',
  },

  // Button
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },

  // Error
  errorBox: {
    backgroundColor: '#fdf2f2',
    borderWidth: 1,
    borderColor: '#f5c6c6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: colors.muted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
