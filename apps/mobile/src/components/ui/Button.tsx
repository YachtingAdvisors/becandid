import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { iconMap } from './Icon';

const colors = {
  primary: '#226779',
  surface: '#ffffff',
  bg: '#eeeeed',
  text: '#313333',
  error: '#a83836',
};

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    text: { color: '#ffffff' },
  },
  secondary: {
    container: { backgroundColor: colors.bg },
    text: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
  danger: {
    container: {
      backgroundColor: colors.error,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    text: { color: '#ffffff' },
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}: ButtonProps) {
  const vStyle = variantStyles[variant];
  const ionName = icon ? iconMap[icon] ?? (icon as keyof typeof Ionicons.glyphMap) : undefined;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        vStyle.container,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={vStyle.text.color as string}
          style={styles.loader}
        />
      ) : (
        <>
          {ionName && (
            <Ionicons
              name={ionName as keyof typeof Ionicons.glyphMap}
              size={18}
              color={vStyle.text.color as string}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, vStyle.text]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  icon: {
    marginRight: 8,
  },
  loader: {
    marginRight: 0,
  },
  disabled: {
    opacity: 0.5,
  },
});
