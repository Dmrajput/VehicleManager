import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import PrimaryButton from './PrimaryButton';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{'\u26A0\uFE0F'}</Text>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <PrimaryButton title="Try Again" variant="outline" onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  message: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  action: { marginTop: spacing.xl, minWidth: 160 },
});
