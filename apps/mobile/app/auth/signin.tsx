// ============================================================
// apps/mobile/app/auth/signin.tsx
//
// Sign-in screen for Be Candid. Clean, iOS-native feeling.
// Supports biometric (Face ID / Fingerprint) re-authentication.
// ============================================================

import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  getBiometricType,
} from '../../src/lib/biometric';

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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading, session, biometricEnabled, enableBiometric } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'iris' | null>(null);

  // Check biometric availability on mount
  useEffect(() => {
    async function checkBiometric() {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const type = await getBiometricType();
        setBiometricType(type);
      }
    }
    checkBiometric();
  }, []);

  // If biometric is enabled and available, auto-prompt on mount
  useEffect(() => {
    if (biometricEnabled && biometricAvailable && !session) {
      handleBiometricSignIn();
    }
  }, [biometricEnabled, biometricAvailable]);

  const biometricLabel =
    biometricType === 'face'
      ? 'Sign in with Face ID'
      : biometricType === 'iris'
        ? 'Sign in with Iris'
        : 'Sign in with Fingerprint';

  const handleBiometricSignIn = async () => {
    setError(null);
    const success = await authenticateWithBiometric();
    if (success) {
      // Biometric passed -- the stored Supabase session is still valid
      // (onAuthStateChange will pick it up). Navigate to main app.
      router.replace('/(tabs)');
    }
  };

  const handleSignIn = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);

      // After first successful password login, offer biometric enrollment
      if (biometricAvailable && !biometricEnabled) {
        Alert.alert(
          'Enable Biometric Login?',
          `Use ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'} to sign in next time?`,
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Enable', onPress: () => enableBiometric() },
          ],
        );
      }

      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || loading;

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
          <Text style={styles.tagline}>Accountability starts here</Text>
        </View>

        {/* Biometric button -- shown above form when enabled */}
        {biometricAvailable && biometricEnabled && (
          <View style={styles.biometricSection}>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.biometricIcon}>
                {biometricType === 'face' ? '👤' : '🔒'}
              </Text>
              <Text style={styles.biometricButtonText}>{biometricLabel}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use password</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
            placeholder="Your password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            onSubmitEditing={handleSignIn}
            returnKeyType="go"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric button -- shown below form when available but not yet enabled */}
          {biometricAvailable && !biometricEnabled && (
            <TouchableOpacity
              style={styles.secondaryBiometricButton}
              onPress={handleBiometricSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBiometricText}>{biometricLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/auth/forgot-password')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
            disabled={isLoading}
          >
            <Text style={styles.footerLink}>Sign Up</Text>
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

  // Biometric
  biometricSection: {
    marginBottom: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    gap: 10,
  },
  biometricIcon: {
    fontSize: 20,
  },
  biometricButtonText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.muted,
    fontSize: 13,
    marginHorizontal: 12,
  },
  secondaryBiometricButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  secondaryBiometricText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
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

  // Links
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
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
