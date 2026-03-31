import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { iconMap } from './Icon';

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: RNTextInputProps['keyboardType'];
  icon?: string;
  multiline?: boolean;
}

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  icon,
  multiline,
}: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const ionName = icon ? iconMap[icon] ?? (icon as keyof typeof Ionicons.glyphMap) : undefined;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {ionName && (
          <Ionicons
            name={ionName as keyof typeof Ionicons.glyphMap}
            size={18}
            color="#5e5f5f"
            style={styles.icon}
          />
        )}
        <RNTextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9e9e9e"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#5e5f5f',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeed',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: '#226779',
  },
  inputError: {
    borderColor: '#a83836',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#313333',
    paddingVertical: 14,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 14,
  },
  error: {
    fontSize: 12,
    color: '#a83836',
    marginTop: 4,
    marginLeft: 4,
  },
});
