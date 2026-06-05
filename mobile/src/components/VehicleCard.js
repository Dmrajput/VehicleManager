import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, shadow } from '../theme';
import { vehicleDisplayName } from '../utils/format';

export default function VehicleCard({ vehicle, onPress }) {
  const isBike = vehicle.type === 'Bike';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: isBike ? colors.secondaryLight : colors.primaryLight }]}>
        <Text style={styles.icon}>{isBike ? '\uD83C\uDFCD\uFE0F' : '\uD83D\uDE97'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{vehicleDisplayName(vehicle)}</Text>
        <Text style={styles.number}>{vehicle.number}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{vehicle.type}</Text>
          </View>
          {vehicle.fuelType ? (
            <View style={[styles.badge, styles.badgeAlt]}>
              <Text style={[styles.badgeText, { color: colors.secondary }]}>{vehicle.fuelType}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={styles.chevron}>{'\u203A'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  icon: { fontSize: 26 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  number: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeAlt: { backgroundColor: colors.secondaryLight },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  chevron: { fontSize: 26, color: colors.textMuted, marginLeft: spacing.sm },
});
