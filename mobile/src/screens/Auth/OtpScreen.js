import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { GradientHeader, PrimaryButton } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius } from '../../theme';

const OTP_LENGTH = 6;

export default function OtpScreen({ route, navigation }) {
  const { mobile, devOtp } = route.params || {};
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const inputs = useRef([]);

  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const loading = useAuthStore((s) => s.loading);

  // Prefill in dev mode for convenience.
  useEffect(() => {
    if (devOtp) setDigits(String(devOtp).padStart(OTP_LENGTH, '0').slice(0, OTP_LENGTH).split(''));
  }, [devOtp]);

  const onChange = (text, index) => {
    const value = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const onKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const onVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');
    try {
      await verifyOtp({ mobile, otp });
      // Navigation switches automatically once token is set in the store.
    } catch (e) {
      setError(e.message);
    }
  };

  const onResend = async () => {
    try {
      const data = await requestOtp({ mobile, isSignup: false });
      if (data?.devOtp) {
        setDigits(String(data.devOtp).slice(0, OTP_LENGTH).split(''));
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Verify OTP" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.lead}>Enter the 6-digit code sent to</Text>
        <Text style={styles.mobile}>+91 {mobile}</Text>

        {devOtp ? <Text style={styles.devHint}>Dev OTP: {devOtp}</Text> : null}

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              style={[styles.otpInput, d && styles.otpFilled]}
              keyboardType="number-pad"
              maxLength={1}
              value={d}
              onChangeText={(t) => onChange(t, i)}
              onKeyPress={(e) => onKeyPress(e, i)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton title="Verify & Continue" onPress={onVerify} loading={loading} />

        <Pressable onPress={onResend} style={styles.resend}>
          <Text style={styles.resendText}>Didn't get the code? <Text style={styles.resendBold}>Resend</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  body: { padding: spacing.xl },
  lead: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  mobile: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  devHint: { textAlign: 'center', color: colors.secondary, marginTop: spacing.sm, fontWeight: '600' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xxl },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  otpFilled: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  resend: { alignItems: 'center', marginTop: spacing.xl },
  resendText: { color: colors.textSecondary, fontSize: 14 },
  resendBold: { color: colors.primary, fontWeight: '700' },
});
