import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField, PasswordField, PrimaryButton } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius } from '../../theme';

const TABS = [
  { id: 'otp', label: 'Login with OTP' },
  { id: 'password', label: 'Login with Password' },
];

export default function LoginScreen({ navigation }) {
  const [tab, setTab] = useState('otp'); // default: OTP
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const requestOtp = useAuthStore((s) => s.requestOtp);
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const loading = useAuthStore((s) => s.loading);

  const validMobile = () => /^\d{10}$/.test(mobile);

  const onSendOtp = async () => {
    if (!validMobile()) return setError('Enter a valid 10-digit mobile number');
    setError('');
    try {
      const data = await requestOtp({ mobile, isSignup: false });
      navigation.navigate('Otp', { mobile, devOtp: data?.devOtp });
    } catch (e) {
      setError(e.message);
    }
  };

  const onPasswordLogin = async () => {
    if (!validMobile()) return setError('Enter a valid 10-digit mobile number');
    if (!password) return setError('Please enter your password');
    setError('');
    try {
      await loginWithPassword({ mobile, password });
      // Navigation switches automatically once the token is set in the store.
    } catch (e) {
      setError(e.message);
    }
  };

  const switchTab = (id) => {
    setTab(id);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <LinearGradient colors={[colors.primaryLight, colors.secondaryLight]} style={styles.heroCircle}>
              <Text style={styles.heroIcon}>{'\uD83D\uDC4B'}</Text>
            </LinearGradient>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue managing your vehicles</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => switchTab(t.id)}
                style={[styles.tab, tab === t.id && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <TextField
            label="Mobile Number"
            value={mobile}
            onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="Enter mobile number"
            keyboardType="number-pad"
            error={tab === 'otp' ? error : undefined}
            left={<Text style={styles.prefix}>+91</Text>}
          />

          {tab === 'password' && (
            <>
              <PasswordField
                label="Password"
                value={password}
                onChangeText={setPassword}
                error={error}
              />
              <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </>
          )}

          {tab === 'otp' ? (
            <PrimaryButton title="Send OTP" onPress={onSendOtp} loading={loading} />
          ) : (
            <PrimaryButton title="Login" onPress={onPasswordLogin} loading={loading} />
          )}

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
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  heroCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroIcon: { fontSize: 52 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.full },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  prefix: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: spacing.sm },
  forgot: { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg },
  forgotText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
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
