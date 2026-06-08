import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GradientHeader, ReminderCard, EmptyState, ListSkeleton } from '../../components';
import { reminderApi } from '../../api';
import { colors, spacing } from '../../theme';

export default function ReminderListScreen({ route, navigation }) {
  const { vehicleId, vehicleName } = route.params || {};
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await reminderApi.list();
      const all = res.data || [];
      // When opened for a specific vehicle, show only that vehicle's reminders.
      const filtered = vehicleId
        ? all.filter((r) => String(r.vehicleId) === String(vehicleId))
        : all;
      setReminders(filtered);
    } catch (e) {
      // keep last good data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const title = vehicleName ? `${vehicleName} Reminders` : 'All Reminders';
  const subtitle = loading ? undefined : `${reminders.length} reminder${reminders.length === 1 ? '' : 's'}`;

  return (
    <View style={styles.container}>
      <GradientHeader title={title} subtitle={subtitle} onBack={() => navigation.goBack()} />

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
          {reminders.length ? (
            <>
              <Text style={styles.hint}>Tap a reminder to edit its renewal date.</Text>
              {reminders.map((r, i) => (
                <ReminderCard
                  key={`${r.vehicleId}-${r.type}-${i}`}
                  reminder={r}
                  onPress={() =>
                    navigation.navigate('EditReminders', {
                      vehicleId: r.vehicleId,
                    })
                  }
                  style={{ marginBottom: spacing.md }}
                />
              ))}
            </>
          ) : (
            <EmptyState
              icon={'\u23F0'}
              title="No reminders"
              message="Add renewal dates to your vehicles to get reminders here."
            />
          )}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.lg },
  hint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
});
