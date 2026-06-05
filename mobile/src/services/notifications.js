import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotifications = async () => {
  try {
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
export const scheduleReminderNotifications = async ({ title, body, dueDate, daysBefore = [30, 15, 7, 1] }) => {
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
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // noop
  }
};

// Re-sync all locally scheduled reminders based on the latest server data.
export const syncRemindersToNotifications = async (reminders = []) => {
  await cancelAllNotifications();
  for (const r of reminders) {
    await scheduleReminderNotifications({
      title: `${r.type} Reminder`,
      body: `${r.vehicleName} (${r.vehicleNumber}) ${r.type} is due.`,
      dueDate: r.dueDate,
    });
  }
};
