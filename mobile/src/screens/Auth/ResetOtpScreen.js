import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GradientHeader, PrimaryButton, OtpInput } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing } from '../../theme';

const OTP_LENGTH = 6;

export default function ResetOtpScreen({ route, navigation }) {
  const { mobile, devOtp } = route.params || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const verifyResetOtp = useAuthStore((s) => s.verifyResetOtp);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (devOtp) setCode(String(devOtp).slice(0, OTP_LENGTH));
  }, [devOtp]);

  const onVerify = async () => {
    if (code.length !== OTP_LENGTH) return setError('Please enter the full 6-digit code');
    setError('');
    try {
      const data = await verifyResetOtp({ mobile, otp: code });
      navigation.navigate('NewPassword', { mobile, resetToken: data?.resetToken });
    } catch (e) {
      setError(e.message);
    }
  };

  const onResend = async () => {
    setError('');
    try {
      const data = await forgotPassword({ mobile });
      if (data?.devOtp) setCode(String(data.devOtp).slice(0, OTP_LENGTH));
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

        <OtpInput value={code} onChange={setCode} length={OTP_LENGTH} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton title="Verify" onPress={onVerify} loading={loading} />

        <Pressable onPress={onResend} style={styles.resend}>
          <Text style={styles.resendText}>
            Didn't get the code? <Text style={styles.resendBold}>Resend</Text>
          </Text>
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
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  resend: { alignItems: 'center', marginTop: spacing.xl },
  resendText: { color: colors.textSecondary, fontSize: 14 },
  resendBold: { color: colors.primary, fontWeight: '700' },
});
