import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GradientHeader, Card, DateField, PrimaryButton, ListSkeleton } from '../../components';
import { vehicleApi, reminderApi } from '../../api';
import useVehicleStore from '../../store/vehicleStore';
import { syncRemindersToNotifications } from '../../services/notifications';
import { colors, spacing } from '../../theme';
import { vehicleDisplayName, toISODate } from '../../utils/format';

// Convert a stored date (ISO/Date) to a YYYY-MM-DD string for the DateField.
const toDateInput = (value) => (value ? toISODate(value) : '');

export default function EditRemindersScreen({ route, navigation }) {
  const { vehicleId, vehicle: initialVehicle } = route.params || {};
  const updateVehicle = useVehicleStore((s) => s.updateVehicle);

  const [vehicle, setVehicle] = useState(initialVehicle || null);
  const [loading, setLoading] = useState(!initialVehicle);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    insuranceExpiry: toDateInput(initialVehicle?.insuranceExpiry),
    pucExpiry: toDateInput(initialVehicle?.pucExpiry),
    nextServiceDate: toDateInput(initialVehicle?.nextServiceDate),
  });

  // Fetch the vehicle if it wasn't passed in (e.g. navigated from a reminder card).
  useEffect(() => {
    let active = true;
    if (!initialVehicle && vehicleId) {
      vehicleApi
        .get(vehicleId)
        .then((res) => {
          if (!active) return;
          const v = res.data?.vehicle || res.data;
          setVehicle(v);
          setForm({
            insuranceExpiry: toDateInput(v?.insuranceExpiry),
            pucExpiry: toDateInput(v?.pucExpiry),
            nextServiceDate: toDateInput(v?.nextServiceDate),
          });
        })
        .catch(() => {})
        .finally(() => active && setLoading(false));
    }
    return () => {
      active = false;
    };
  }, [vehicleId, initialVehicle]);

  const setField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // Basic YYYY-MM-DD validation; empty is allowed (clears that reminder).
  const isValidDate = (s) => !s || /^\d{4}-\d{2}-\d{2}$/.test(s);

  const onSave = async () => {
    if (![form.insuranceExpiry, form.pucExpiry, form.nextServiceDate].every(isValidDate)) {
      Alert.alert('Invalid date', 'Please use the YYYY-MM-DD format (or leave blank).');
      return;
    }
    setSaving(true);
    try {
      await updateVehicle(vehicleId, {
        insuranceExpiry: form.insuranceExpiry || null,
        pucExpiry: form.pucExpiry || null,
        nextServiceDate: form.nextServiceDate || null,
      });

      // Re-sync local notifications with the latest reminder dates.
      try {
        const rem = await reminderApi.list();
        await syncRemindersToNotifications(rem.data || []);
      } catch (e) {
        // non-fatal
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Edit Reminders"
        subtitle={vehicle ? vehicleDisplayName(vehicle) : undefined}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <ListSkeleton count={3} />
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.help}>
              Set renewal dates to get reminders at 30, 15, 7 and 1 day before. Leave a field blank
              to remove that reminder.
            </Text>

            <Card>
              <DateField
                label={'\uD83D\uDEE1\uFE0F  Insurance Expiry'}
                value={form.insuranceExpiry}
                onChange={setField('insuranceExpiry')}
              />
              <DateField
                label={'\uD83C\uDF31  PUC Expiry'}
                value={form.pucExpiry}
                onChange={setField('pucExpiry')}
              />
              <DateField
                label={'\uD83D\uDD27  Next Service Date'}
                value={form.nextServiceDate}
                onChange={setField('nextServiceDate')}
              />
            </Card>

            <PrimaryButton
              title="Save Reminders"
              onPress={onSave}
              loading={saving}
              style={{ marginTop: spacing.lg }}
            />
            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.lg },
  help: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 19 },
});
