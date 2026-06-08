import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  GradientHeader,
  Card,
  PrimaryButton,
  StatCard,
  ReminderCard,
  EmptyState,
  ListSkeleton,
  FuelActivityRow,
  ServiceActivityRow,
} from '../../components';
import { vehicleApi, reminderApi } from '../../api';
import useVehicleStore from '../../store/vehicleStore';
import { colors, spacing, radius } from '../../theme';
import { formatCurrency, formatDate, vehicleDisplayName } from '../../utils/format';

const TABS = ['Overview', 'Service', 'Fuel', 'Reminders'];

export default function VehicleDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const deleteVehicle = useVehicleStore((s) => s.deleteVehicle);

  const load = useCallback(async () => {
    try {
      const [res, rem] = await Promise.all([vehicleApi.get(id), reminderApi.list()]);
      setData(res.data);
      setReminders((rem.data || []).filter((r) => String(r.vehicleId) === String(id)));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = () => {
    Alert.alert('Delete Vehicle', 'This will remove the vehicle and all its records. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVehicle(id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const vehicle = data?.vehicle;
  const stats = data?.stats;

  return (
    <View style={styles.container}>
      <GradientHeader
        title={vehicle ? vehicleDisplayName(vehicle) : 'Vehicle'}
        subtitle={vehicle?.number}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={onDelete} hitSlop={10}>
            <Text style={styles.deleteIcon}>{'\uD83D\uDDD1\uFE0F'}</Text>
          </Pressable>
        }
      />

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
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
              icon={'\uD83D\uDD27'}
              label="Services"
              value={stats?.totalServices ?? 0}
              style={{ marginRight: spacing.md }}
            />
            <StatCard
              icon={'\u26FD'}
              label="Fuel Entries"
              value={stats?.totalFuelEntries ?? 0}
              tint={colors.secondary}
              tintBg={colors.secondaryLight}
              style={{ marginRight: spacing.md }}
            />
            <StatCard
              icon={'\uD83D\uDCB0'}
              label="Total Spent"
              value={formatCurrency(stats?.totalExpenses)}
              tint={colors.success}
              tintBg={colors.successLight}
            />
          </View>

          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'Overview' && <OverviewTab vehicle={vehicle} />}
          {tab === 'Service' && <ServiceTab services={data?.services} />}
          {tab === 'Fuel' && <FuelTab fuel={data?.fuel} />}
          {tab === 'Reminders' && (
            <RemindersTab
              reminders={reminders}
              onOpenList={() =>
                navigation.navigate('ReminderList', {
                  vehicleId: id,
                  vehicleName: vehicle ? vehicleDisplayName(vehicle) : undefined,
                })
              }
              onEdit={() => navigation.navigate('EditReminders', { vehicleId: id, vehicle })}
            />
          )}

          <View style={styles.actions}>
            <PrimaryButton
              title="Add Fuel"
              variant="outline"
              onPress={() => navigation.navigate('AddFuel', { vehicleId: id })}
              style={{ flex: 1, marginRight: spacing.md }}
            />
            <PrimaryButton
              title="Add Service"
              onPress={() => navigation.navigate('AddService', { vehicleId: id })}
              style={{ flex: 1 }}
            />
          </View>
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function OverviewTab({ vehicle }) {
  if (!vehicle) return null;
  return (
    <Card>
      <InfoRow label="Type" value={vehicle.type} />
      <InfoRow label="Brand" value={vehicle.brand} />
      <InfoRow label="Model" value={vehicle.model} />
      <InfoRow label="Year" value={vehicle.year ? String(vehicle.year) : '-'} />
      <InfoRow label="Fuel Type" value={vehicle.fuelType} />
      <InfoRow label="Odometer" value={vehicle.odometer ? `${vehicle.odometer} km` : '-'} />
      <InfoRow label="Insurance Expiry" value={formatDate(vehicle.insuranceExpiry)} />
      <InfoRow label="PUC Expiry" value={formatDate(vehicle.pucExpiry)} />
      <InfoRow label="Next Service" value={formatDate(vehicle.nextServiceDate)} />
    </Card>
  );
}

function ServiceTab({ services }) {
  if (!services?.length) {
    return <EmptyState icon={'\uD83D\uDD27'} title="No service records" message="Service records will appear here." />;
  }
  return (
    <Card>
      {services.map((s) => (
        <ServiceActivityRow key={s._id} record={s} />
      ))}
    </Card>
  );
}

function FuelTab({ fuel }) {
  if (!fuel?.length) {
    return <EmptyState icon={'\u26FD'} title="No fuel entries" message="Fuel entries will appear here." />;
  }
  return (
    <Card>
      {fuel.map((f) => (
        <FuelActivityRow key={f._id} entry={f} />
      ))}
    </Card>
  );
}

function RemindersTab({ reminders, onOpenList, onEdit }) {
  if (!reminders?.length) {
    return (
      <View>
        <EmptyState icon={'\u23F0'} title="No reminders" message="Add renewal dates to get reminders." />
        <PrimaryButton title="Edit Reminders" onPress={onEdit} style={{ marginTop: spacing.md }} />
      </View>
    );
  }
  return (
    <View>
      {reminders.map((r, i) => (
        <ReminderCard
          key={`${r.type}-${i}`}
          reminder={r}
          onPress={onOpenList}
          style={{ marginBottom: spacing.md }}
        />
      ))}
      <PrimaryButton title="Edit Reminders" variant="outline" onPress={onEdit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.lg },
  deleteIcon: { fontSize: 18 },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.full },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  actions: { flexDirection: 'row', marginTop: spacing.lg },
});
