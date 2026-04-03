// ============================================================
// mobile/src/lib/biometric.ts
//
// Biometric authentication helpers using expo-local-authentication.
// Wraps Face ID / Touch ID / Fingerprint into a simple API.
// ============================================================

import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Check whether biometric hardware is available and enrolled.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * Prompt the user for biometric authentication.
 * Returns true if authentication succeeded, false otherwise.
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Sign in to Be Candid',
    cancelLabel: 'Use Password',
    disableDeviceFallback: true,
  });

  return result.success;
}

/**
 * Determine which type of biometric is available on the device.
 */
export async function getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | null> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'face';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }

  return null;
}
