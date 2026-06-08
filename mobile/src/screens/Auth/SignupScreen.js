import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { GradientHeader, TextField, PasswordField, PrimaryButton } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing } from '../../theme';

const MIN_PASSWORD = 6;

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const loading = useAuthStore((s) => s.loading);

  const setField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const onSubmit = async () => {
    if (!form.name.trim()) return setError('Please enter your full name');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Enter a valid 10-digit mobile number');
    if (form.password.length < MIN_PASSWORD)
      return setError(`Password must be at least ${MIN_PASSWORD} characters`);
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setError('');
    try {
      const data = await requestOtp({
        name: form.name.trim(),
        mobile: form.mobile,
        email: form.email.trim(),
        password: form.password,
        isSignup: true,
      });
      navigation.navigate('Otp', { mobile: form.mobile, devOtp: data?.devOtp });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Create Account" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>Tell us a bit about you to get started.</Text>

          <TextField label="Full Name" value={form.name} onChangeText={setField('name')} placeholder="John Doe" />
          <TextField
            label="Mobile Number"
            value={form.mobile}
            onChangeText={(t) => setField('mobile')(t.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="10-digit mobile"
            keyboardType="number-pad"
            left={<Text style={styles.prefix}>+91</Text>}
          />
          <TextField
            label="Email (Optional)"
            value={form.email}
            onChangeText={setField('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordField
            label="Password"
            value={form.password}
            onChangeText={setField('password')}
            placeholder="At least 6 characters"
          />
          <PasswordField
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={setField('confirmPassword')}
            placeholder="Re-enter password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Sign Up" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.xl },
  intro: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl },
  prefix: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.md },
});
