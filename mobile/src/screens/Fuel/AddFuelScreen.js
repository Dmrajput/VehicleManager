import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GradientHeader, TextField, SelectField, DateField, PrimaryButton, EmptyState } from '../../components';
import useVehicleStore from '../../store/vehicleStore';
import useInterstitialAd from '../../hooks/useInterstitialAd';
import { colors, spacing } from '../../theme';
import { toISODate, vehicleDisplayName } from '../../utils/format';

export default function AddFuelScreen({ route, navigation }) {
  const { vehicleId } = route.params || {};
  const { vehicles, fetchVehicles, addFuel } = useVehicleStore();
  const { registerAction } = useInterstitialAd();

  const [form, setForm] = useState({
    vehicle: vehicleId || '',
    amount: '',
    liters: '',
    odometer: '',
    date: toISODate(),
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
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.liters || Number(form.liters) <= 0) e.liters = 'Enter valid liters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addFuel({
        vehicle: form.vehicle,
        amount: Number(form.amount),
        liters: Number(form.liters),
        odometer: form.odometer ? Number(form.odometer) : 0,
        date: form.date,
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
        <GradientHeader title="Add Fuel" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={'\uD83D\uDE97'}
          title="No vehicles yet"
          message="Add a vehicle before logging fuel."
          actionLabel="Add Vehicle"
          onAction={() => navigation.navigate('AddVehicle')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Add Fuel" onBack={() => navigation.goBack()} />
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
          <TextField
            label="Fuel Amount"
            value={form.amount}
            onChangeText={(t) => setField('amount')(t.replace(/[^0-9.]/g, ''))}
            placeholder="1500"
            keyboardType="decimal-pad"
            left={<Text style={styles.prefix}>{'\u20B9'}</Text>}
            error={errors.amount}
          />
          <TextField
            label="Fuel Quantity (Liters)"
            value={form.liters}
            onChangeText={(t) => setField('liters')(t.replace(/[^0-9.]/g, ''))}
            placeholder="14"
            keyboardType="decimal-pad"
            error={errors.liters}
          />
          <TextField
            label="Odometer Reading (km)"
            value={form.odometer}
            onChangeText={(t) => setField('odometer')(t.replace(/[^0-9]/g, ''))}
            placeholder="12500"
            keyboardType="number-pad"
          />
          <DateField label="Date" value={form.date} onChange={setField('date')} />

          <PrimaryButton title="Save Fuel Entry" onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
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
