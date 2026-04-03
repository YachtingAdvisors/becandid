import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

// Keep legacy variants as aliases
type LegacyVariant = 'low' | 'medium' | 'high' | 'active' | 'inactive';

interface BadgeProps {
  text: string;
  variant?: BadgeColor | LegacyVariant;
  pulse?: boolean;
}

const colorMap: Record<string, { container: ViewStyle; text: TextStyle }> = {
  // New color variants
  primary: {
    container: { backgroundColor: 'rgba(34,103,121,0.12)' },
    text: { color: '#226779' },
  },
  success: {
    container: { backgroundColor: 'rgba(52,199,89,0.15)' },
    text: { color: '#248a3d' },
  },
  warning: {
    container: { backgroundColor: 'rgba(245,158,11,0.15)' },
    text: { color: '#b45309' },
  },
  error: {
    container: { backgroundColor: 'rgba(168,56,54,0.12)' },
    text: { color: '#a83836' },
  },
  neutral: {
    container: { backgroundColor: '#e5e5e5' },
    text: { color: '#5e5f5f' },
  },
  // Legacy aliases
  low: {
    container: { backgroundColor: 'rgba(34,103,121,0.12)' },
    text: { color: '#226779' },
  },
  medium: {
    container: { backgroundColor: 'rgba(245,158,11,0.15)' },
    text: { color: '#b45309' },
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

export function Badge({ text, variant = 'primary', pulse = false }: BadgeProps) {
  const vStyle = colorMap[variant] ?? colorMap.primary;
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // infinite
        false,
      );
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, vStyle.container, pulse && pulseStyle]}>
      {pulse && (
        <View style={[styles.pulseDot, { backgroundColor: vStyle.text.color as string }]} />
      )}
      <Text style={[styles.text, vStyle.text]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
