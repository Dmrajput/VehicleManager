import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { GradientHeader, TextField, PrimaryButton } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const loading = useAuthStore((s) => s.loading);

  const onSubmit = async () => {
    if (!/^\d{10}$/.test(mobile)) return setError('Enter a valid 10-digit mobile number');
    setError('');
    try {
      const data = await forgotPassword({ mobile });
      navigation.navigate('ResetOtp', { mobile, devOtp: data?.devOtp });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Forgot Password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            Enter your registered mobile number and we'll send you a verification code to reset your
            password.
          </Text>

          <TextField
            label="Mobile Number"
            value={mobile}
            onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="Enter mobile number"
            keyboardType="number-pad"
            error={error}
            left={<Text style={styles.prefix}>+91</Text>}
          />

          <PrimaryButton title="Send OTP" onPress={onSubmit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.xl },
  intro: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 20 },
  prefix: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: spacing.sm },
});
