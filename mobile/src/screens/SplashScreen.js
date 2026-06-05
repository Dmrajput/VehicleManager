import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function SplashScreen() {
  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoIcon}>{'\uD83D\uDE97'}</Text>
      </View>
      <Text style={styles.title}>Vehicle Manager</Text>
      <Text style={styles.tagline}>Manage your vehicle the smart way</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoIcon: { fontSize: 54 },
  title: { fontSize: 30, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
});
