import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import VehicleListScreen from '../screens/Vehicles/VehicleListScreen';
import ExpensesScreen from '../screens/Expenses/ExpensesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const icons = {
  Home: '\uD83C\uDFE0',
  Vehicles: '\uD83D\uDE97',
  Expenses: '\uD83D\uDCB0',
  Profile: '\uD83D\uDC64',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: colors.divider,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>{icons[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Vehicles" component={VehicleListScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
