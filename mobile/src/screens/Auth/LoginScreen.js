import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField, PrimaryButton } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius } from '../../theme';

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const loading = useAuthStore((s) => s.loading);

  const onContinue = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    try {
      const data = await requestOtp({ mobile, isSignup: false });
      navigation.navigate('Otp', { mobile, devOtp: data?.devOtp });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <LinearGradient colors={[colors.primaryLight, colors.secondaryLight]} style={styles.heroCircle}>
              <Text style={styles.heroIcon}>{'\uD83D\uDC4B'}</Text>
            </LinearGradient>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue managing your vehicles</Text>
          </View>

          <TextField
            label="Mobile Number"
            value={mobile}
            onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="Enter mobile number"
            keyboardType="number-pad"
            error={error}
            left={<Text style={styles.prefix}>+91</Text>}
          />

          <PrimaryButton title="Continue" onPress={onContinue} loading={loading} />

          <Text style={styles.or}>or</Text>

          <Pressable onPress={() => navigation.navigate('Signup')} style={styles.signupLink}>
            <Text style={styles.signupText}>
              New here? <Text style={styles.signupTextBold}>Create an account</Text>
            </Text>
          </Pressable>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms & Conditions and Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: spacing.xxl },
  heroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  heroIcon: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  prefix: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: spacing.sm },
  or: { textAlign: 'center', color: colors.textMuted, marginVertical: spacing.lg },
  signupLink: { alignItems: 'center' },
  signupText: { fontSize: 14, color: colors.textSecondary },
  signupTextBold: { color: colors.primary, fontWeight: '700' },
  terms: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 18,
  },
});
