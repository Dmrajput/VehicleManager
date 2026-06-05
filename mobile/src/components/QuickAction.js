import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function QuickAction({ icon, label, onPress, tint = colors.primary, tintBg = colors.primaryLight }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.7 }]}>
      <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>
        <Text style={[styles.icon, { color: tint }]}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 22 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
});
