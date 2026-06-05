import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import PrimaryButton from './PrimaryButton';

export default function EmptyState({ icon = '\uD83D\uDE97', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  icon: { fontSize: 56, marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  action: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
