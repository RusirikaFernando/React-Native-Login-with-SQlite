import * as Notifications from "expo-notifications";


// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleRecurringNotification = async (months, userId) => {
  if (months < 1) {
    throw new Error("Recurrence period must be at least 1 month.");
  }

  const now = new Date();
  const trigger = new Date();

  // Set trigger to exactly 'months' months ahead at 9 AM
  trigger.setMonth(trigger.getMonth() + months);
  trigger.setHours(9, 0, 0, 0);

  // Ensure the trigger is in the future
  if (trigger <= now) {
    trigger.setMonth(trigger.getMonth() + months); // Add another period
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🩺 Checkup Reminder",
      body: "Time for your next creatinine test!",
      data: { userId },
    },
    trigger: {
      date: trigger, // Make sure this is in the future
    },
  });

  return notificationId;
};


export const cancelNotification = async (notificationId) => {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};


export const scheduleRecurringNotification2 = async (months, userId) => {
  if (months < 1) {
    throw new Error("Recurrence period must be at least 1 month.");
  }

  const now = new Date();
  const trigger = new Date();

  // Set initial trigger to next month's date at 9 AM
  trigger.setMonth(trigger.getMonth() + months);
  trigger.setHours(9, 0, 0, 0);

  // Ensure trigger is in the future
  if (trigger <= now) {
    trigger.setMonth(trigger.getMonth() + months); // Add another period
  }

  // Simulate a notification ID without scheduling a notification
  const notificationId = `simulated-notification-id-${Date.now()}`;

  return notificationId;
};
