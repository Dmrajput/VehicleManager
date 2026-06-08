import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// Configuration is centralized in the .env file (see .env.example).
//
// IMPORTANT: Expo's Babel transform only inlines EXPO_PUBLIC_* variables when
// they are accessed with a LITERAL name (e.g. process.env.EXPO_PUBLIC_API_URL).
// Dynamic access like process.env[key] will NOT work, so every variable below
// is read by its literal name and then parsed with these tiny helpers.
// ---------------------------------------------------------------------------
const asString = (value, fallback) => (value != null && value !== '' ? value : fallback);

const asNumber = (value, fallback) => {
  const n = Number(value);
  return value != null && value !== '' && !Number.isNaN(n) ? n : fallback;
};

const asBool = (value, fallback) => {
  if (value == null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const asNumberList = (value, fallback) => {
  if (!value) return fallback;
  const list = String(value)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  return list.length ? list : fallback;
};

// ---- API configuration ----------------------------------------------------
const API_PORT = asNumber(process.env.EXPO_PUBLIC_API_PORT, 5000);

// Try to discover the dev machine's host (LAN IP) from the Expo/Metro connection.
// On a physical device this resolves to your computer's LAN IP automatically,
// which is exactly where the backend is reachable.
const getDevServerHost = () => {
  const candidates = [
    Constants?.expoConfig?.hostUri,
    Constants?.expoGoConfig?.debuggerHost,
    Constants?.manifest?.debuggerHost,
    Constants?.manifest2?.extra?.expoGo?.debuggerHost,
  ];
  const hostUri = candidates.find(Boolean);
  if (!hostUri) return null;
  // hostUri looks like "192.168.1.50:8081" -> take the host part
  return hostUri.split(':')[0];
};

// API base URL resolution priority:
// 1. EXPO_PUBLIC_API_URL env override (e.g. a deployed backend)
// 2. Auto-derived from the Expo dev server host (works on real devices)
// 3. Platform fallback (Android emulator -> 10.0.2.2, others -> localhost)
const resolveBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  const host = getDevServerHost();
  if (host) return `http://${host}:${API_PORT}/api`;

  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:${API_PORT}/api`;
};

export const API_BASE_URL = resolveBaseUrl();

export const API_TIMEOUT = asNumber(process.env.EXPO_PUBLIC_API_TIMEOUT, 15000);

// ---- App metadata ---------------------------------------------------------
export const APP_NAME = asString(process.env.EXPO_PUBLIC_APP_NAME, 'Vehicle Manager');

export const PRIVACY_POLICY_URL = asString(
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
  'https://example.com/privacy'
);

export const STORE_URL = asString(
  process.env.EXPO_PUBLIC_STORE_URL,
  'https://play.google.com/store'
);

// ---- Local storage keys ---------------------------------------------------
export const STORAGE_KEYS = {
  TOKEN: '@vm_token',
  USER: '@vm_user',
  ACTION_COUNT: '@vm_action_count',
};

// ---- Domain enums ---------------------------------------------------------
export const VEHICLE_TYPES = ['Bike', 'Car'];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export const SERVICE_TYPES = ['General Service', 'Oil Change', 'Repair', 'Washing'];

export const REMINDER_TYPES = ['Service', 'Insurance', 'PUC'];

// ---- Notifications --------------------------------------------------------
// Hour of the day (local device time, 24h) at which reminders fire. Default 9 AM.
export const NOTIFICATION_HOUR = asNumber(process.env.EXPO_PUBLIC_NOTIFICATION_HOUR, 9);

// Minutes added per vehicle so multiple vehicles do not all fire at once.
// Vehicle #1 -> 09:00, #2 -> 09:15, #3 -> 09:30, ...
export const NOTIFICATION_VEHICLE_OFFSET_MINUTES = asNumber(
  process.env.EXPO_PUBLIC_NOTIFICATION_VEHICLE_OFFSET,
  15
);

// How many days BEFORE the due date the daily reminders should start. A vehicle
// reminder fires once per day, every day, from (dueDate - window) through the
// due date itself, then stops automatically. Keeps far-future dates (e.g. an
// insurance a year away) from scheduling hundreds of notifications.
export const REMINDER_WINDOW_DAYS = asNumber(process.env.EXPO_PUBLIC_REMINDER_WINDOW_DAYS, 30);

// Hard cap on total OS-scheduled notifications. iOS allows max 64 pending local
// notifications; we stay under that and schedule the soonest ones first.
export const MAX_SCHEDULED_NOTIFICATIONS = asNumber(
  process.env.EXPO_PUBLIC_MAX_SCHEDULED_NOTIFICATIONS,
  60
);

// Android notification channel id used for all reminders.
export const NOTIFICATION_CHANNEL_ID = 'reminders';

// Legacy: kept for backward compatibility with older .env files. No longer used
// by the scheduler (reminders are now daily within REMINDER_WINDOW_DAYS).
export const REMINDER_DAYS_BEFORE = asNumberList(
  process.env.EXPO_PUBLIC_REMINDER_DAYS,
  [30, 15, 7, 1]
);

// ---- AdMob ----------------------------------------------------------------
// Defaults are Google's official TEST unit IDs. Replace via .env for production.
export const ADMOB = {
  enabled: asBool(process.env.EXPO_PUBLIC_ADS_ENABLED, true),
  androidAppId: asString(
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
    'ca-app-pub-3940256099942544~3347511713'
  ),
  iosAppId: asString(
    process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
    'ca-app-pub-3940256099942544~1458002511'
  ),
  banner: asString(process.env.EXPO_PUBLIC_ADMOB_BANNER, 'ca-app-pub-3940256099942544/6300978111'),
  interstitial: asString(
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL,
    'ca-app-pub-3940256099942544/1033173712'
  ),
  rewarded: asString(
    process.env.EXPO_PUBLIC_ADMOB_REWARDED,
    'ca-app-pub-3940256099942544/5224354917'
  ),
};

// Show an interstitial ad after this many user actions.
export const INTERSTITIAL_ACTION_THRESHOLD = asNumber(
  process.env.EXPO_PUBLIC_INTERSTITIAL_THRESHOLD,
  5
);

export default {
  API_BASE_URL,
  API_TIMEOUT,
  APP_NAME,
  STORAGE_KEYS,
  VEHICLE_TYPES,
  FUEL_TYPES,
  SERVICE_TYPES,
  REMINDER_TYPES,
  REMINDER_DAYS_BEFORE,
  ADMOB,
  INTERSTITIAL_ACTION_THRESHOLD,
};
