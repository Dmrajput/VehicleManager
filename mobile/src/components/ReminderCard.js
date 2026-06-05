import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../theme';
import { formatDate, daysLeftLabel } from '../utils/format';

const statusColor = {
  overdue: { tint: colors.danger, bg: colors.dangerLight },
  urgent: { tint: colors.danger, bg: colors.dangerLight },
  soon: { tint: colors.warning, bg: colors.warningLight },
  upcoming: { tint: colors.success, bg: colors.successLight },
};

const typeIcon = {
  Service: '\uD83D\uDD27',
  Insurance: '\uD83D\uDEE1\uFE0F',
  PUC: '\uD83C\uDF31',
};

export default function ReminderCard({ reminder, style }) {
  const palette = statusColor[reminder.status] || statusColor.upcoming;
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Text style={styles.icon}>{typeIcon[reminder.type] || '\u23F0'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{reminder.type} Due</Text>
        <Text style={styles.date}>{formatDate(reminder.dueDate)}</Text>
      </View>
      <Text style={[styles.days, { color: palette.tint }]}>{daysLeftLabel(reminder.daysLeft)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 18 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  days: { fontSize: 12, fontWeight: '700' },
});
