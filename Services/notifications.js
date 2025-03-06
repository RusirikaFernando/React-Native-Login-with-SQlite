import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleRecurringNotification = async (months, userId) => {
  const trigger = new Date();
  trigger.setMonth(trigger.getMonth() + months);
  trigger.setHours(9, 0, 0); // 9 AM

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🩺 Checkup Reminder',
      body: 'Time for your next creatinine test!',
      data: { userId },
    },
    trigger: {
      date: trigger,
      repeats: true,
      repeatInterval: months * 30 * 24 * 60 * 60,
    },
  });

  return notificationId;
};

export const cancelNotification = async (notificationId) => {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};