import React, { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import TextField from './TextField';
import { colors, spacing } from '../theme';

/**
 * Password input with a show/hide toggle, built on top of TextField.
 */
export default function PasswordField({
  label = 'Password',
  value,
  onChangeText,
  placeholder = 'Enter password',
  error,
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      error={error}
      right={
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10}>
          <Text style={styles.toggle}>{visible ? '\uD83D\uDE48 Hide' : '\uD83D\uDC41 Show'}</Text>
        </Pressable>
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  toggle: { color: colors.primary, fontWeight: '700', fontSize: 13, paddingLeft: spacing.sm },
});
