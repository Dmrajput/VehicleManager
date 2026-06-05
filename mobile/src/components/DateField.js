import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import TextField from './TextField';
import { colors, spacing } from '../theme';
import { toISODate } from '../utils/format';

/**
 * Lightweight date input (YYYY-MM-DD) to avoid extra native dependencies so it
 * runs in Expo Go. Swap for @react-native-community/datetimepicker if you want
 * a native calendar UI.
 */
export default function DateField({ label, value, onChange, error }) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      keyboardType="numbers-and-punctuation"
      error={error}
      right={
        <Pressable onPress={() => onChange(toISODate())} hitSlop={8}>
          <Text style={styles.today}>Today</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  today: { color: colors.primary, fontWeight: '700', fontSize: 13, paddingLeft: spacing.sm },
});
