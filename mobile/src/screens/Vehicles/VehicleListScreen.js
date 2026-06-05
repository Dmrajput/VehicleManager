import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VehicleCard, EmptyState, ErrorState, ListSkeleton, AdBanner } from '../../components';
import useVehicleStore from '../../store/vehicleStore';
import { colors, spacing, radius, shadow } from '../../theme';

export default function VehicleListScreen({ navigation }) {
  const { vehicles, loading, error, fetchVehicles } = useVehicleStore();
  const [refreshing, setRefreshing] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const load = useCallback(async () => {
    try {
      await fetchVehicles();
    } catch (e) {
      // handled by store error state
    } finally {
      setFirstLoad(false);
      setRefreshing(false);
    }
  }, [fetchVehicles]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Vehicles</Text>
        <Text style={styles.count}>{vehicles.length} registered</Text>
      </View>

      {firstLoad && loading ? (
        <ListSkeleton count={4} />
      ) : error && !vehicles.length ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <VehicleCard vehicle={item} onPress={() => navigation.navigate('VehicleDetails', { id: item._id })} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={'\uD83D\uDE97'}
              title="No vehicles yet"
              message="Add your first vehicle to start tracking fuel, services and reminders."
              actionLabel="Add Vehicle"
              onAction={() => navigation.navigate('AddVehicle')}
            />
          }
          ListFooterComponent={vehicles.length ? <AdBanner style={{ marginTop: spacing.md }} /> : null}
        />
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddVehicle')}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  count: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  fabIcon: { color: colors.white, fontSize: 30, fontWeight: '600', marginTop: -2 },
});
