import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GradientHeader, TextField, SelectField, DateField, PrimaryButton, EmptyState } from '../../components';
import useVehicleStore from '../../store/vehicleStore';
import useInterstitialAd from '../../hooks/useInterstitialAd';
import { SERVICE_TYPES } from '../../constants';
import { colors, spacing } from '../../theme';
import { toISODate, vehicleDisplayName } from '../../utils/format';

export default function AddServiceScreen({ route, navigation }) {
  const { vehicleId } = route.params || {};
  const { vehicles, fetchVehicles, addService } = useVehicleStore();
  const { registerAction } = useInterstitialAd();

  const [form, setForm] = useState({
    vehicle: vehicleId || '',
    serviceType: 'General Service',
    cost: '',
    odometer: '',
    date: toISODate(),
    nextServiceDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vehicles.length) fetchVehicles().catch(() => {});
  }, [vehicles.length, fetchVehicles]);

  useEffect(() => {
    if (!form.vehicle && vehicles.length) {
      setForm((f) => ({ ...f, vehicle: vehicleId || vehicles[0]._id }));
    }
  }, [vehicles, vehicleId, form.vehicle]);

  const setField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const vehicleOptions = vehicles.map((v) => ({ label: `${vehicleDisplayName(v)} (${v.number})`, value: v._id }));
  const selectedLabel = vehicleOptions.find((o) => o.value === form.vehicle)?.label;

  const validate = () => {
    const e = {};
    if (!form.vehicle) e.vehicle = 'Select a vehicle';
    if (!form.cost || Number(form.cost) < 0) e.cost = 'Enter a valid cost';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addService({
        vehicle: form.vehicle,
        serviceType: form.serviceType,
        cost: Number(form.cost),
        odometer: form.odometer ? Number(form.odometer) : 0,
        date: form.date,
        nextServiceDate: form.nextServiceDate || null,
        notes: form.notes,
      });
      registerAction();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!vehicles.length) {
    return (
      <View style={styles.container}>
        <GradientHeader title="Add Service" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={'\uD83D\uDE97'}
          title="No vehicles yet"
          message="Add a vehicle before logging a service."
          actionLabel="Add Vehicle"
          onAction={() => navigation.navigate('AddVehicle')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Add Service Record" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SelectField
            label="Vehicle"
            value={selectedLabel}
            options={vehicleOptions.map((o) => o.label)}
            onChange={(label) => {
              const match = vehicleOptions.find((o) => o.label === label);
              if (match) setField('vehicle')(match.value);
            }}
            error={errors.vehicle}
          />
          <DateField label="Service Date" value={form.date} onChange={setField('date')} />
          <SelectField
            label="Service Type"
            value={form.serviceType}
            options={SERVICE_TYPES}
            onChange={setField('serviceType')}
          />
          <TextField
            label="Service Cost"
            value={form.cost}
            onChangeText={(t) => setField('cost')(t.replace(/[^0-9.]/g, ''))}
            placeholder="2500"
            keyboardType="decimal-pad"
            left={<Text style={styles.prefix}>{'\u20B9'}</Text>}
            error={errors.cost}
          />
          <TextField
            label="Odometer Reading (km)"
            value={form.odometer}
            onChangeText={(t) => setField('odometer')(t.replace(/[^0-9]/g, ''))}
            placeholder="12500"
            keyboardType="number-pad"
          />
          <TextField
            label="Notes (Optional)"
            value={form.notes}
            onChangeText={setField('notes')}
            placeholder="Engine oil changed, general checkup done."
            multiline
          />
          <DateField label="Next Service Date" value={form.nextServiceDate} onChange={setField('nextServiceDate')} />

          <PrimaryButton title="Save Record" onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.lg },
  prefix: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: spacing.sm },
});
