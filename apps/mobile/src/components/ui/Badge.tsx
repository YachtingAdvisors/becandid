import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'low' | 'medium' | 'high' | 'active' | 'inactive';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
  low: {
    container: { backgroundColor: 'rgba(34,103,121,0.12)' },
    text: { color: '#226779' },
  },
  medium: {
    container: { backgroundColor: 'rgba(34,103,121,0.12)' },
    text: { color: '#226779' },
  },
  high: {
    container: { backgroundColor: '#a83836' },
    text: { color: '#ffffff' },
  },
  active: {
    container: { backgroundColor: 'rgba(52,199,89,0.15)' },
    text: { color: '#248a3d' },
  },
  inactive: {
    container: { backgroundColor: '#e5e5e5' },
    text: { color: '#5e5f5f' },
  },
};

export function Badge({ text, variant = 'low' }: BadgeProps) {
  const vStyle = variantStyles[variant];

  return (
    <View style={[styles.container, vStyle.container]}>
      <Text style={[styles.text, vStyle.text]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
