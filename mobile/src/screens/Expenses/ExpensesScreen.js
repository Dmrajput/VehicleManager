import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import {
  Card,
  StatCard,
  SectionHeader,
  AdBanner,
  ListSkeleton,
  EmptyState,
  FuelActivityRow,
  ServiceActivityRow,
} from '../../components';
import { userApi, fuelApi, serviceApi } from '../../api';
import { colors, spacing, radius } from '../../theme';
import { formatCurrency } from '../../utils/format';

const screenWidth = Dimensions.get('window').width;

const chartConfig = (lineColor) => ({
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 0,
  color: (opacity = 1) => lineColor,
  labelColor: () => colors.textSecondary,
  propsForDots: { r: '4', strokeWidth: '2', stroke: lineColor },
  propsForBackgroundLines: { stroke: colors.divider },
});

export default function ExpensesScreen() {
  const [tab, setTab] = useState('Fuel');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trends, setTrends] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [fuelTx, setFuelTx] = useState([]);
  const [serviceTx, setServiceTx] = useState([]);

  const load = useCallback(async () => {
    try {
      const [t, d, f, s] = await Promise.all([
        userApi.expenses(6),
        userApi.dashboard(),
        fuelApi.list({ limit: 5 }),
        serviceApi.list({ limit: 5 }),
      ]);
      setTrends(t.data);
      setDashboard(d.data);
      setFuelTx(f.data || []);
      setServiceTx(s.data || []);
    } catch (e) {
      // ignore
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

  const hasData = trends && trends.labels?.length;
  const seriesKey = tab === 'Fuel' ? 'fuel' : 'service';
  const lineColor = tab === 'Fuel' ? colors.secondary : colors.primary;
  const series = trends?.[seriesKey] || [];
  const safeSeries = series.length ? series : [0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>Track your fuel & service spending</Text>
      </View>

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.statsRow}>
            <StatCard
              icon={'\u26FD'}
              label="Fuel (Month)"
              value={formatCurrency(dashboard?.monthlyFuelCost)}
              tint={colors.secondary}
              tintBg={colors.secondaryLight}
              style={{ marginRight: spacing.md }}
            />
            <StatCard
              icon={'\uD83D\uDD27'}
              label="Service (Month)"
              value={formatCurrency(dashboard?.monthlyServiceCost)}
              style={{ marginRight: spacing.md }}
            />
            <StatCard
              icon={'\uD83D\uDCB0'}
              label="Total (Month)"
              value={formatCurrency(dashboard?.monthlyTotal)}
              tint={colors.success}
              tintBg={colors.successLight}
            />
          </View>

          <View style={styles.toggle}>
            {['Fuel', 'Service'].map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.toggleBtn, tab === t && styles.toggleActive]}>
                <Text style={[styles.toggleText, tab === t && styles.toggleTextActive]}>{t} Trend</Text>
              </Pressable>
            ))}
          </View>

          <Card padded={false} style={styles.chartCard}>
            {hasData ? (
              <LineChart
                data={{ labels: trends.labels, datasets: [{ data: safeSeries }] }}
                width={screenWidth - spacing.lg * 2}
                height={220}
                chartConfig={chartConfig(lineColor)}
                bezier
                fromZero
                style={styles.chart}
                yAxisLabel={'\u20B9'}
              />
            ) : (
              <View style={{ padding: spacing.xl }}>
                <Text style={styles.muted}>No expense data yet.</Text>
              </View>
            )}
          </Card>

          <SectionHeader title="Recent Transactions" />
          <Card>
            {tab === 'Fuel' ? (
              fuelTx.length ? (
                fuelTx.map((f) => <FuelActivityRow key={f._id} entry={f} />)
              ) : (
                <Text style={styles.muted}>No fuel transactions.</Text>
              )
            ) : serviceTx.length ? (
              serviceTx.map((s) => <ServiceActivityRow key={s._id} record={s} />)
            ) : (
              <Text style={styles.muted}>No service transactions.</Text>
            )}
          </Card>

          <View style={{ height: spacing.xl }} />
          <AdBanner />
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  content: { padding: spacing.lg },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.full },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  toggleTextActive: { color: colors.white },
  chartCard: { paddingVertical: spacing.md, overflow: 'hidden' },
  chart: { borderRadius: radius.lg },
  muted: { color: colors.textSecondary, fontSize: 14, paddingVertical: spacing.sm, textAlign: 'center' },
});
