import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ value, onValueChange, label, description }: ToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d1d1', true: '#34c759' }}
        thumbColor="#ffffff"
        ios_backgroundColor="#d1d1d1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#313333',
  },
  description: {
    fontSize: 13,
    color: '#5e5f5f',
    marginTop: 2,
    lineHeight: 18,
  },
});
