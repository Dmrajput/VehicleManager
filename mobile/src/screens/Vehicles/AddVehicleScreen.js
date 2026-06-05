import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  GradientHeader,
  TextField,
  SelectField,
  ChipSelector,
  DateField,
  PrimaryButton,
} from '../../components';
import useVehicleStore from '../../store/vehicleStore';
import { VEHICLE_TYPES, FUEL_TYPES } from '../../constants';
import { colors, spacing } from '../../theme';

const initialForm = {
  type: 'Car',
  number: '',
  brand: '',
  model: '',
  year: '',
  fuelType: 'Petrol',
  insuranceExpiry: '',
  pucExpiry: '',
  nextServiceDate: '',
};

export default function AddVehicleScreen({ navigation }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const addVehicle = useVehicleStore((s) => s.addVehicle);

  const setField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.number.trim()) e.number = 'Vehicle number is required';
    if (form.year && (Number(form.year) < 1950 || Number(form.year) > new Date().getFullYear() + 1)) {
      e.year = 'Enter a valid year';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        insuranceExpiry: form.insuranceExpiry || null,
        pucExpiry: form.pucExpiry || null,
        nextServiceDate: form.nextServiceDate || null,
      };
      await addVehicle(payload);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Add Vehicle" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ChipSelector label="Vehicle Type" options={VEHICLE_TYPES} value={form.type} onChange={setField('type')} />

          <TextField
            label="Vehicle Number"
            value={form.number}
            onChangeText={(t) => setField('number')(t.toUpperCase())}
            placeholder="MH01AB1234"
            autoCapitalize="characters"
            error={errors.number}
          />
          <TextField label="Brand" value={form.brand} onChangeText={setField('brand')} placeholder="Honda" />
          <TextField label="Model" value={form.model} onChangeText={setField('model')} placeholder="City" />
          <TextField
            label="Year"
            value={form.year}
            onChangeText={(t) => setField('year')(t.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="2021"
            keyboardType="number-pad"
            error={errors.year}
          />
          <SelectField label="Fuel Type" value={form.fuelType} options={FUEL_TYPES} onChange={setField('fuelType')} />

          <Text style={styles.sectionTitle}>Renewal Dates (for reminders)</Text>
          <DateField label="Insurance Expiry" value={form.insuranceExpiry} onChange={setField('insuranceExpiry')} />
          <DateField label="PUC Expiry" value={form.pucExpiry} onChange={setField('pucExpiry')} />
          <DateField label="Next Service Date" value={form.nextServiceDate} onChange={setField('nextServiceDate')} />

          <PrimaryButton title="Save Vehicle" onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: spacing.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
