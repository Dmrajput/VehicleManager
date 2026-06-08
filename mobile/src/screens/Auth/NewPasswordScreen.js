import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GradientHeader, PasswordField, PrimaryButton } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing } from '../../theme';

const MIN_PASSWORD = 6;

export default function NewPasswordScreen({ route, navigation }) {
  const { mobile, resetToken } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const resetPassword = useAuthStore((s) => s.resetPassword);
  const loading = useAuthStore((s) => s.loading);

  const onSubmit = async () => {
    if (password.length < MIN_PASSWORD)
      return setError(`Password must be at least ${MIN_PASSWORD} characters`);
    if (password !== confirm) return setError('Passwords do not match');
    setError('');
    try {
      await resetPassword({ mobile, resetToken, newPassword: password });
      Alert.alert('Success', 'Your password has been updated. Please log in with your new password.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Create New Password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>Choose a strong new password for your account.</Text>

          <PasswordField
            label="New Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
          />
          <PasswordField
            label="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter new password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            title="Update Password"
            onPress={onSubmit}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.xl },
  intro: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md },
});
