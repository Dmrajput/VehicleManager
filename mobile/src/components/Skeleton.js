import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export function SkeletonBox({ width = '100%', height = 16, style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.box, { width, height, opacity }, style]} />;
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width={48} height={48} style={{ borderRadius: radius.md }} />
      <View style={{ flex: 1, marginLeft: spacing.lg }}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="40%" height={12} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <View style={{ padding: spacing.lg }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.divider,
    borderRadius: radius.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
});

export default SkeletonBox;
