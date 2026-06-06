import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ADMOB } from '../constants';
import { colors, radius, spacing } from '../theme';

/**
 * Placeholder banner ad.
 *
 * Real AdMob banners require `react-native-google-mobile-ads`, which needs a
 * custom dev client / EAS build (it does NOT run in Expo Go). To enable real
 * ads: install the package, configure app IDs in app.json, then swap this
 * component's body for <BannerAd unitId={ADMOB.banner} size={...} />.
 * See README for full steps.
 */
export default function AdBanner({ style }) {
  // Respect the EXPO_PUBLIC_ADS_ENABLED flag from .env.
  if (!ADMOB.enabled) return null;

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>Ad</Text>
      <Text style={styles.text}>AdMob Banner Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 56,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  text: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
});
