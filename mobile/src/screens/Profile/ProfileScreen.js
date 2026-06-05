import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Share, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius } from '../../theme';

function Row({ icon, label, value, onPress, right }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.6 }]}>
      <View style={styles.rowIcon}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {right || (value ? <Text style={styles.rowValue}>{value}</Text> : null)}
        {onPress ? <Text style={styles.chevron}>{'\u203A'}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [notifications, setNotifications] = useState(user?.settings?.notificationsEnabled ?? true);

  const toggleNotifications = async (val) => {
    setNotifications(val);
    try {
      await updateProfile({ settings: { notificationsEnabled: val } });
    } catch (e) {
      setNotifications(!val);
    }
  };

  const onShare = () => {
    Share.share({
      message: 'Manage all your vehicle expenses, services and reminders with Vehicle Manager! 🚗',
    }).catch(() => {});
  };

  const onRate = () => {
    Linking.openURL('https://play.google.com/store').catch(() => {});
  };

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Vehicle Owner'}</Text>
          <Text style={styles.mobile}>+91 {user?.mobile}</Text>
          {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card padded={false}>
            <Row icon={'\uD83D\uDE97'} label="Manage Vehicles" onPress={() => navigation.navigate('Vehicles')} />
            <Row
              icon={'\uD83D\uDD14'}
              label="Notifications"
              right={
                <Switch
                  value={notifications}
                  onValueChange={toggleNotifications}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={colors.white}
                />
              }
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <Card padded={false}>
            <Row icon={'\u2B50'} label="Rate App" onPress={onRate} />
            <Row icon={'\uD83D\uDCE4'} label="Share App" onPress={onShare} />
            <Row
              icon={'\uD83D\uDD12'}
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://example.com/privacy').catch(() => {})}
            />
          </Card>
        </View>

        <Pressable style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.version}>Vehicle Manager v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { paddingBottom: spacing.xxl },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: colors.white },
  name: { fontSize: 20, fontWeight: '800', color: colors.white },
  mobile: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, color: colors.textSecondary, marginRight: spacing.sm },
  chevron: { fontSize: 22, color: colors.textMuted },
  logout: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.xl },
});
