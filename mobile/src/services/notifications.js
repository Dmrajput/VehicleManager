import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { REMINDER_DAYS_BEFORE } from '../constants';

// Expo Go (SDK 53+) removed push/notification support; local notifications must
// run in a development or production build. Detect Expo Go so we skip cleanly
// instead of spamming the red "removed from Expo Go" error in the console.
const isExpoGo = Constants?.executionEnvironment === 'storeClient';

let warned = false;
const warnOnce = () => {
  if (!warned) {
    warned = true;
    console.log(
      '[notifications] Skipped in Expo Go. Build a dev client (npx expo run:android / eas build) to enable reminders.'
    );
  }
};

// Lazy-load the native module only when we actually intend to use it, so simply
// importing this file in Expo Go does not trigger the module warning.
const getNotifications = () => {
  // eslint-disable-next-line global-require
  return require('expo-notifications');
};

const ensureHandler = (Notifications) => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const registerForPushNotifications = async () => {
  if (isExpoGo) {
    warnOnce();
    return false;
  }
  try {
    const Notifications = getNotifications();
    ensureHandler(Notifications);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const res = await Notifications.requestPermissionsAsync();
      status = res.status;
    }
    return status === 'granted';
  } catch (e) {
    return false;
  }
};

// Schedule reminders at 30/15/7/1 days before a due date.
export const scheduleReminderNotifications = async ({ title, body, dueDate, daysBefore = REMINDER_DAYS_BEFORE }) => {
  if (isExpoGo) return [];
  const Notifications = getNotifications();
  const due = new Date(dueDate).getTime();
  const scheduled = [];

  for (const days of daysBefore) {
    const triggerTime = due - days * 24 * 60 * 60 * 1000;
    if (triggerTime <= Date.now()) continue;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body: `${body} (in ${days} day${days > 1 ? 's' : ''})` },
        trigger: { date: new Date(triggerTime), channelId: 'reminders' },
      });
      scheduled.push(id);
    } catch (e) {
      // ignore scheduling failure for a single trigger
    }
  }
  return scheduled;
};

export const cancelAllNotifications = async () => {
  if (isExpoGo) return;
  try {
    const Notifications = getNotifications();
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // noop
  }
};

// Re-sync all locally scheduled reminders based on the latest server data.
export const syncRemindersToNotifications = async (reminders = []) => {
  if (isExpoGo) return;
  await cancelAllNotifications();
  for (const r of reminders) {
    await scheduleReminderNotifications({
      title: `${r.type} Reminder`,
      body: `${r.vehicleName} (${r.vehicleNumber}) ${r.type} is due.`,
      dueDate: r.dueDate,
    });
  }
};
