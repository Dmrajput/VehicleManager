import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

/**
 * Controlled 6-box OTP input. Parent owns the code string.
 *   <OtpInput value={code} onChange={setCode} />
 */
export default function OtpInput({ value = '', onChange, length = 6 }) {
  const inputs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const setDigit = (text, index) => {
    const char = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    onChange(next.join(''));
    if (char && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const onKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          style={[styles.box, d && styles.filled]}
          keyboardType="number-pad"
          maxLength={1}
          value={d}
          onChangeText={(t) => setDigit(t, i)}
          onKeyPress={(e) => onKeyPress(e, i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xxl },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  filled: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
