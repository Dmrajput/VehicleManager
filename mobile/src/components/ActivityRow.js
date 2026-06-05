import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatCurrency, formatDate, vehicleDisplayName } from '../utils/format';

export default function ActivityRow({ icon, tint, tintBg, title, subtitle, amount, date }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>
        <Text style={[styles.icon, { color: tint }]}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {amount != null ? <Text style={styles.amount}>{formatCurrency(amount)}</Text> : null}
        {date ? <Text style={styles.date}>{formatDate(date)}</Text> : null}
      </View>
    </View>
  );
}

export function FuelActivityRow({ entry }) {
  return (
    <ActivityRow
      icon={'\u26FD'}
      tint={colors.secondary}
      tintBg={colors.secondaryLight}
      title="Fuel Added"
      subtitle={`${entry.liters} L  \u2022  ${vehicleDisplayName(entry.vehicle)}`}
      amount={entry.amount}
      date={entry.date}
    />
  );
}

export function ServiceActivityRow({ record }) {
  return (
    <ActivityRow
      icon={'\uD83D\uDD27'}
      tint={colors.primary}
      tintBg={colors.primaryLight}
      title={record.serviceType}
      subtitle={vehicleDisplayName(record.vehicle)}
      amount={record.cost}
      date={record.date}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 18 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: colors.text },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
