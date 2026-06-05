import Constants from 'expo-constants';

// API base URL resolution:
// - Android emulator reaches host machine via 10.0.2.2
// - iOS simulator can use localhost
// - Physical device should use your machine's LAN IP (set EXPO_PUBLIC_API_URL)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants?.expoConfig?.extra?.apiBaseUrl ||
  'http://10.0.2.2:5000/api';

export const STORAGE_KEYS = {
  TOKEN: '@vm_token',
  USER: '@vm_user',
  ACTION_COUNT: '@vm_action_count',
};

export const VEHICLE_TYPES = ['Bike', 'Car'];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export const SERVICE_TYPES = ['General Service', 'Oil Change', 'Repair', 'Washing'];

export const REMINDER_TYPES = ['Service', 'Insurance', 'PUC'];

// Show an interstitial ad after this many user actions.
export const INTERSTITIAL_ACTION_THRESHOLD = 5;

// AdMob unit IDs (replace with real IDs for production).
export const ADMOB = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

export default { API_BASE_URL, STORAGE_KEYS, VEHICLE_TYPES, FUEL_TYPES, SERVICE_TYPES };
