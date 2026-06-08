import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  NOTIFICATION_HOUR,
  NOTIFICATION_VEHICLE_OFFSET_MINUTES,
  REMINDER_WINDOW_DAYS,
  MAX_SCHEDULED_NOTIFICATIONS,
  NOTIFICATION_CHANNEL_ID,
} from '../constants';

// ---------------------------------------------------------------------------
// Reminder notification service
//
// Behaviour (per the product spec):
//   - Each vehicle reminder (Service / Insurance / PUC) fires ONCE PER DAY,
//     every day, from (dueDate - REMINDER_WINDOW_DAYS) through the due date,
//     then stops automatically (no notifications scheduled past the due date).
//   - All reminders fire at NOTIFICATION_HOUR (09:00 local) plus a per-vehicle
//     offset of NOTIFICATION_VEHICLE_OFFSET_MINUTES (vehicle #1 09:00, #2 09:15...).
//   - Re-syncing always cancels first, so duplicates can never accumulate.
//
// These are OS-scheduled LOCAL notifications, so they fire in the foreground,
// background, and when the app is fully closed, and they survive app/device
// restarts (expo-notifications reschedules on boot).
// ---------------------------------------------------------------------------

// Expo Go (SDK 53+) removed local-notification support; it only works in a dev
// or production build. Detect Expo Go so we skip cleanly instead of crashing.
const isExpoGo = Constants?.executionEnvironment === 'storeClient';

// -------------------------- logging ----------------------------------------
const TAG = '[notifications]';
const log = (...args) => {
  if (__DEV__) console.log(TAG, ...args);
};
const logWarn = (...args) => {
  if (__DEV__) console.warn(TAG, ...args);
};

let warned = false;
const warnExpoGoOnce = () => {
  if (!warned) {
    warned = true;
    log('Skipped: notifications are unavailable in Expo Go. Use a dev/production build (npx expo run:android / eas build).');
  }
};

// Lazy-require the native module so merely importing this file in Expo Go does
// not trigger the "removed from Expo Go" warning.
const getNotifications = () => {
  // eslint-disable-next-line global-require
  return require('expo-notifications');
};

// -------------------------- setup ------------------------------------------
const ensureHandler = (Notifications) => {
  // Controls how a notification is presented while the app is in the foreground.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      // Newer SDK keys:
      shouldShowBanner: true,
      shouldShowList: true,
      // Legacy key (kept for back-compat with older expo-notifications):
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

const ensureAndroidChannel = async (Notifications) => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563EB',
    sound: 'default',
  });
};

let listenersBound = false;
const bindForegroundListeners = (Notifications) => {
  if (listenersBound || !__DEV__) return;
  listenersBound = true;
  // "Notification Triggered" log (only observable in foreground/background open).
  Notifications.addNotificationReceivedListener((n) => {
    const data = n?.request?.content?.data || {};
    log('Notification Triggered:', n?.request?.content?.title, '| vehicle:', data.vehicleId, '| type:', data.type);
  });
};

/**
 * Request permissions and configure the Android channel. Safe to call on every
 * app launch. Returns true if notifications are permitted.
 */
export const registerForPushNotifications = async () => {
  if (isExpoGo) {
    warnExpoGoOnce();
    return false;
  }
  try {
    const Notifications = getNotifications();
    ensureHandler(Notifications);
    await ensureAndroidChannel(Notifications);
    bindForegroundListeners(Notifications);

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const res = await Notifications.requestPermissionsAsync();
      status = res.status;
    }
    log('Permission Status:', status);
    return status === 'granted';
  } catch (e) {
    logWarn('registerForPushNotifications failed:', e?.message);
    return false;
  }
};

// -------------------------- helpers ----------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (input) => {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
};

// "30 June" style date used in notification bodies.
const formatDueDate = (dueDate) =>
  new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

// YYYY-MM-DD key for a date (local), used for de-duplication / health checks.
const dayKey = (date) => {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

// Title/body for each reminder type, per the spec.
const buildContent = (reminder) => {
  const name = reminder.vehicleName || reminder.vehicleNumber || 'your vehicle';
  const when = formatDueDate(reminder.dueDate);
  switch (reminder.type) {
    case 'Service':
      return { title: 'Vehicle Service Due', body: `Your ${name} service is due on ${when}.` };
    case 'Insurance':
      return { title: 'Insurance Expiring Soon', body: `Insurance for ${name} expires on ${when}.` };
    case 'PUC':
      return { title: 'PUC Expiring Soon', body: `PUC for ${name} expires on ${when}.` };
    default:
      return { title: `${reminder.type} Reminder`, body: `${name} ${reminder.type} is due on ${when}.` };
  }
};

// Assign each vehicle a stable slot index (0,1,2,...) so its offset is deterministic.
const buildVehicleOffsetMap = (reminders) => {
  const ids = [...new Set(reminders.map((r) => String(r.vehicleId)))].sort();
  const map = new Map();
  ids.forEach((id, index) => map.set(id, index));
  return map;
};

// Build the list of fire times for one reminder: every day at HOUR:offset, from
// (dueDate - window) through the due date, skipping any time already in the past.
const buildDailyTriggers = (reminder, offsetMinutes, now) => {
  const triggers = [];
  if (!reminder?.dueDate) return triggers;

  const due = new Date(reminder.dueDate);
  if (Number.isNaN(due.getTime())) return triggers;

  const dueDay = startOfDay(due);
  const windowStart = startOfDay(new Date(dueDay.getTime() - REMINDER_WINDOW_DAYS * DAY_MS));
  const today = startOfDay(now);
  // Start from the later of "today" and "window start".
  let cursor = today.getTime() > windowStart.getTime() ? today : windowStart;
  cursor = startOfDay(cursor);

  const content = buildContent(reminder);

  for (let t = cursor.getTime(); t <= dueDay.getTime(); t += DAY_MS) {
    const fire = new Date(t);
    fire.setHours(NOTIFICATION_HOUR, 0, 0, 0);
    // Per-vehicle offset; getMinutes()+offset handles >60 rollover into later hours.
    fire.setMinutes(fire.getMinutes() + offsetMinutes);

    if (fire.getTime() <= now.getTime()) continue; // already passed today

    triggers.push({
      time: fire,
      content,
      data: {
        vehicleId: String(reminder.vehicleId),
        type: reminder.type,
        dueDate: reminder.dueDate,
        day: dayKey(fire),
      },
    });
  }
  return triggers;
};

// -------------------------- scheduling -------------------------------------

/**
 * Cancel every scheduled reminder. Used before a full re-sync.
 */
export const cancelAllNotifications = async () => {
  if (isExpoGo) return;
  try {
    const Notifications = getNotifications();
    const before = (await Notifications.getAllScheduledNotificationsAsync()).length;
    await Notifications.cancelAllScheduledNotificationsAsync();
    log('Notification Cancelled: all', before, 'pending notifications cleared');
  } catch (e) {
    logWarn('cancelAllNotifications failed:', e?.message);
  }
};

/**
 * Cancel only the notifications belonging to a single vehicle (used on delete /
 * targeted edits). Looks up pending notifications by their attached data.
 */
export const cancelVehicleNotifications = async (vehicleId) => {
  if (isExpoGo || !vehicleId) return;
  try {
    const Notifications = getNotifications();
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    const mine = pending.filter(
      (n) => String(n?.request?.content?.data?.vehicleId) === String(vehicleId)
    );
    await Promise.all(
      mine.map((n) => Notifications.cancelScheduledNotificationAsync(n.request.identifier))
    );
    log('Notification Cancelled:', mine.length, 'for vehicle', vehicleId);
  } catch (e) {
    logWarn('cancelVehicleNotifications failed:', e?.message);
  }
};

/**
 * Re-sync ALL locally scheduled reminders from the latest server reminder list.
 *
 * Strategy: cancel everything, then (re)schedule. This guarantees there are
 * never duplicate notifications and that edited/deleted reminders disappear.
 *
 * @param {Array} reminders - items shaped like the API /reminders response:
 *   { vehicleId, vehicleName, vehicleNumber, type, dueDate, ... }
 */
export const syncRemindersToNotifications = async (reminders = []) => {
  if (isExpoGo) {
    warnExpoGoOnce();
    return { scheduled: 0, skipped: true };
  }

  const Notifications = getNotifications();
  await ensureAndroidChannel(Notifications);
  await cancelAllNotifications();

  const now = new Date();
  const offsetMap = buildVehicleOffsetMap(reminders);

  // Collect all candidate fire-times across every reminder, then schedule the
  // SOONEST ones first up to MAX_SCHEDULED_NOTIFICATIONS (respects iOS's 64 cap).
  let candidates = [];
  for (const reminder of reminders) {
    const slot = offsetMap.get(String(reminder.vehicleId)) ?? 0;
    const offsetMinutes = slot * NOTIFICATION_VEHICLE_OFFSET_MINUTES;
    candidates = candidates.concat(buildDailyTriggers(reminder, offsetMinutes, now));
  }

  candidates.sort((a, b) => a.time.getTime() - b.time.getTime());

  if (candidates.length > MAX_SCHEDULED_NOTIFICATIONS) {
    log(
      `Capping schedule: ${candidates.length} candidates -> ${MAX_SCHEDULED_NOTIFICATIONS} (iOS limit safety)`
    );
    candidates = candidates.slice(0, MAX_SCHEDULED_NOTIFICATIONS);
  }

  let scheduled = 0;
  for (const c of candidates) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { ...c.content, data: c.data },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date',
          date: c.time,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
      scheduled += 1;
      log(
        'Notification Created:',
        id,
        '|',
        c.content.title,
        '| at',
        c.time.toLocaleString(),
        '| vehicle',
        c.data.vehicleId
      );
    } catch (e) {
      logWarn('Failed to schedule a reminder:', e?.message);
    }
  }

  log('Scheduled Notification Count:', scheduled, 'of', candidates.length, 'candidates');

  if (__DEV__) await checkNotificationHealth();

  return { scheduled, candidates: candidates.length };
};

// -------------------------- diagnostics ------------------------------------

/**
 * Inspect the live notification state and return a detailed health report.
 * Useful to call in dev (it is logged automatically after each sync).
 */
export const checkNotificationHealth = async () => {
  if (isExpoGo) {
    return {
      ok: false,
      environment: 'expo-go',
      message: 'Notifications are not supported in Expo Go. Use a dev/production build.',
    };
  }

  try {
    const Notifications = getNotifications();
    const perm = await Notifications.getPermissionsAsync();
    const channels =
      Platform.OS === 'android' ? await Notifications.getNotificationChannelsAsync() : [];
    const pending = await Notifications.getAllScheduledNotificationsAsync();

    // Group by vehicle+type+day to find duplicates, and validate each schedule.
    const seen = new Map();
    const duplicates = [];
    const invalid = [];
    const byVehicle = {};

    pending.forEach((n) => {
      const data = n?.request?.content?.data || {};
      const key = `${data.vehicleId}|${data.type}|${data.day}`;

      if (!data.vehicleId || !data.type || !data.day) {
        invalid.push(n.request.identifier);
      }

      if (seen.has(key)) {
        duplicates.push(key);
      } else {
        seen.set(key, n.request.identifier);
      }

      const vid = String(data.vehicleId || 'unknown');
      byVehicle[vid] = (byVehicle[vid] || 0) + 1;
    });

    const report = {
      ok: perm.status === 'granted' && invalid.length === 0 && duplicates.length === 0,
      environment: 'native',
      permission: perm.status,
      canScheduleExact: perm.android?.importance ?? null,
      channels: channels.map((c) => ({ id: c.id, importance: c.importance })),
      channelConfigured:
        Platform.OS !== 'android' || channels.some((c) => c.id === NOTIFICATION_CHANNEL_ID),
      pendingCount: pending.length,
      vehiclesWithReminders: Object.keys(byVehicle).length,
      perVehicleCounts: byVehicle,
      duplicateCount: duplicates.length,
      duplicates,
      invalidCount: invalid.length,
      invalid,
    };

    log('checkNotificationHealth =>', JSON.stringify(report, null, 2));
    return report;
  } catch (e) {
    logWarn('checkNotificationHealth failed:', e?.message);
    return { ok: false, environment: 'native', error: e?.message };
  }
};
