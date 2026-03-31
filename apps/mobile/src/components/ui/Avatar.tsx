import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, { container: number; font: number }> = {
  sm: { container: 32, font: 13 },
  md: { container: 44, font: 17 },
  lg: { container: 64, font: 24 },
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const dimensions = sizeMap[size];
  const initial = (name ?? '?').charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: dimensions.font }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#226779',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
