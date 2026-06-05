import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../theme';

export default function StatCard({ icon, label, value, sub, tint = colors.primary, tintBg = colors.primaryLight, style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>
          <Text style={[styles.icon, { color: tint }]}>{icon}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {sub ? <Text style={[styles.sub, { color: tint }]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 12, color: colors.textSecondary, flexShrink: 1, fontWeight: '500' },
  value: { fontSize: 20, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, marginTop: 2, fontWeight: '600' },
});
