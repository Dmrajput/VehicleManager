import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import AddVehicleScreen from '../screens/Vehicles/AddVehicleScreen';
import VehicleDetailsScreen from '../screens/Vehicles/VehicleDetailsScreen';
import EditRemindersScreen from '../screens/Vehicles/EditRemindersScreen';
import ReminderListScreen from '../screens/Vehicles/ReminderListScreen';
import AddFuelScreen from '../screens/Fuel/AddFuelScreen';
import AddServiceScreen from '../screens/Services/AddServiceScreen';
import useAuthStore from '../store/authStore';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!bootstrapped) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
            <Stack.Screen name="ReminderList" component={ReminderListScreen} />
            <Stack.Screen name="EditReminders" component={EditRemindersScreen} />
            <Stack.Screen name="AddFuel" component={AddFuelScreen} />
            <Stack.Screen name="AddService" component={AddServiceScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
});
