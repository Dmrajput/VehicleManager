import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Card,
  StatCard,
  ReminderCard,
  QuickAction,
  SectionHeader,
  AdBanner,
  ListSkeleton,
  EmptyState,
  FuelActivityRow,
  ServiceActivityRow,
} from '../../components';
import { userApi, reminderApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { syncRemindersToNotifications } from '../../services/notifications';
import { colors, spacing, radius } from '../../theme';
import { formatCurrency } from '../../utils/format';

export default function HomeScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [reminders, setReminders] = useState([]);

  const load = useCallback(async () => {
    try {
      const [dash, rem] = await Promise.all([userApi.dashboard(), reminderApi.list()]);
      setDashboard(dash.data);
      setReminders(rem.data);
      syncRemindersToNotifications(rem.data).catch(() => {});
    } catch (e) {
      // keep last good data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const topReminders = reminders.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</Text>
          <Text style={styles.subtitle}>Here's your vehicle overview</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>My Vehicles</Text>
              <Text style={styles.summaryValue}>{dashboard?.totalVehicles ?? 0}</Text>
              <Text style={styles.summarySub}>Total registered</Text>
            </View>
            <View style={styles.summaryIcon}>
              <Text style={{ fontSize: 32 }}>{'\uD83D\uDE97'}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            icon={'\u26FD'}
            label="Fuel (This Month)"
            value={formatCurrency(dashboard?.monthlyFuelCost)}
            tint={colors.secondary}
            tintBg={colors.secondaryLight}
            style={{ marginRight: spacing.md }}
          />
          <StatCard
            icon={'\uD83D\uDD27'}
            label="Service (This Month)"
            value={formatCurrency(dashboard?.monthlyServiceCost)}
          />
        </View>

        <SectionHeader title="Reminders" actionLabel="View All" onAction={() => navigation.navigate('Vehicles')} />
        {loading ? (
          <ListSkeleton count={2} />
        ) : topReminders.length ? (
          topReminders.map((r, i) => (
            <ReminderCard key={`${r.vehicleId}-${r.type}-${i}`} reminder={r} style={{ marginBottom: spacing.md }} />
          ))
        ) : (
          <Card>
            <Text style={styles.muted}>No upcoming reminders. You're all set! ✅</Text>
          </Card>
        )}

        <SectionHeader title="Quick Actions" />
        <Card>
          <View style={styles.quickRow}>
            <QuickAction icon={'\uD83D\uDE97'} label="Add Vehicle" onPress={() => navigation.navigate('AddVehicle')} />
            <QuickAction
              icon={'\u26FD'}
              label="Add Fuel"
              tint={colors.secondary}
              tintBg={colors.secondaryLight}
              onPress={() => navigation.navigate('AddFuel', {})}
            />
            <QuickAction
              icon={'\uD83D\uDD27'}
              label="Add Service"
              tint={colors.success}
              tintBg={colors.successLight}
              onPress={() => navigation.navigate('AddService', {})}
            />
          </View>
        </Card>

        <SectionHeader title="Recent Activity" onAction={() => navigation.navigate('Expenses')} actionLabel="See All" />
        <Card>
          {loading ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : (dashboard?.recentFuel?.length || dashboard?.recentServices?.length) ? (
            <>
              {(dashboard.recentFuel || []).map((f) => (
                <FuelActivityRow key={`f-${f._id}`} entry={f} />
              ))}
              {(dashboard.recentServices || []).map((s) => (
                <ServiceActivityRow key={`s-${s._id}`} record={s} />
              ))}
            </>
          ) : (
            <Text style={styles.muted}>No recent activity yet.</Text>
          )}
        </Card>

        <View style={{ height: spacing.xl }} />
        <AdBanner />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  scroll: { flex: 1, marginTop: -spacing.xxl },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  summaryCard: { marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  summaryValue: { fontSize: 36, fontWeight: '800', color: colors.text, marginVertical: 2 },
  summarySub: { fontSize: 12, color: colors.textMuted },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { color: colors.textSecondary, fontSize: 14, paddingVertical: spacing.sm },
});
