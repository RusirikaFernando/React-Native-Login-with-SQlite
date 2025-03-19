import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";

const NotificationTestScreen = () => {
  // Request notification permissions
  const handleCheckPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        Alert.alert(
          "Permissions",
          `Notification permissions ${newStatus === "granted" ? "granted" : "denied"}.`
        );
      } else {
        Alert.alert("Permissions", "Notification permissions are already granted.");
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      Alert.alert("Error", "Failed to check notification permissions.");
    }
  };

  // Schedule a test notification
  const handleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "TEST",
          body: "This is a test notification!",
        },
        trigger: { seconds: 5 },
      });
      Alert.alert(
        "Test Notification",
        "A test notification will appear in 5 seconds."
      );
    } catch (error) {
      console.error("Error scheduling test notification:", error);
      Alert.alert("Error", "Failed to schedule test notification.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Testing</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCheckPermissions}
      >
        <Text style={styles.buttonText}>Check Permissions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleTestNotification}
      >
        <Text style={styles.buttonText}>Test Notification</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NotificationTestScreen;