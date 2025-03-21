import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { scheduleRecurringNotification2, cancelNotification } from "../../Services/notifications";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ route }) => {
  const db = useSQLiteContext();
  const { userId, newBaseLevel } = route.params;
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [recurrencePeriod, setRecurrencePeriod] = useState("");
  const [creatinineBaseLevel, setCreatinineBaseLevel] = useState("");
  const [notificationId, setNotificationId] = useState(null);
  const [isCancelButtonDisabled, setIsCancelButtonDisabled] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [newBaseLevel]) // Refresh when newBaseLevel changes
  );

  // Fetch user data from SQLite
  const fetchUserData = async () => {
    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );
      if (user) {
        setUsername(user.username);
        setAge(user.age ? String(user.age) : "");
        setRecurrencePeriod(user.recurrence_period ? String(user.recurrence_period) : "");
        setCreatinineBaseLevel(user.creatinine_base_level ? String(user.creatinine_base_level) : "");
        setNotificationId(user.notification_id || null);
        setIsCancelButtonDisabled(!user.notification_id);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  };

  // Listen for changes to newBaseLevel
  useEffect(() => {
    if (newBaseLevel) {
      setCreatinineBaseLevel(newBaseLevel.toFixed(2)); // Update the base level in the UI
    }
  }, [newBaseLevel]);

  // Notification cancellation
  const handleCancelNotification = async () => {
    if (!notificationId) {
      Alert.alert("Error", "No notification to cancel.");
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      Alert.alert("Success", "Notification canceled successfully.");
      setNotificationId(null); // Clear the notification ID in state
      setIsCancelButtonDisabled(true); // Disable the button after cancellation
    } catch (error) {
      console.error("Error canceling notification:", error);
      Alert.alert("Error", "Failed to cancel notification.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!username || !age || !recurrencePeriod) {
      Alert.alert("Error", "Username, age, and recurrence period are required.");
      return;
    }

    try {
      // Cancel existing notification if recurrence period changes
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      // Schedule new notification
      const newNotificationId = await scheduleRecurringNotification2(
        parseInt(recurrencePeriod),
        userId
      );

      // Update database (excluding creatinine_base_level)
      await db.runAsync(
        `UPDATE users 
         SET username = ?, 
             age = ?, 
             recurrence_period = ?, 
             notification_id = ?
         WHERE id = ?`,
        [username, age, recurrencePeriod, newNotificationId, userId]
      );

      // Update local state
      setNotificationId(newNotificationId);
      setIsCancelButtonDisabled(false);

      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // Handle recurrence period change
  const handleUpdateRecurrence = async (newPeriod) => {
    const period = parseInt(newPeriod);

    if (isNaN(period) || period < 1) {
      Alert.alert("Error", "Recurrence period must be at least 1 month.");
      return;
    }

    try {
      // Cancel existing notification
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      // Schedule new notification
      const newNotificationId = await scheduleRecurringNotification2(period, userId);

      // Update database
      await db.runAsync(
        'UPDATE users SET recurrence_period = ?, notification_id = ? WHERE id = ?',
        [period, newNotificationId, userId]
      );

      // Update local state
      setRecurrencePeriod(period.toString());
      setNotificationId(newNotificationId);
      setIsCancelButtonDisabled(false);

      Alert.alert('Success', 'Reminder schedule updated successfully');
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', error.message || 'Failed to update reminder schedule');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image
        source={require("../../assets/images/user.jpg")}
        style={styles.icon}
      />

      <Text style={styles.label}>Username:</Text>
      <TextInput 
        style={styles.input} 
        value={username} 
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Age:</Text>
      <TextInput 
        style={styles.input} 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric"
      />

      <Text style={styles.label}>Recurrence Period (months):</Text>
      <TextInput
        style={styles.input}
        value={recurrencePeriod}
        onChangeText={(text) => {
          if (/^\d*$/.test(text) && (text === "" || parseInt(text) > 0)) {
            setRecurrencePeriod(text);
            if (text) handleUpdateRecurrence(text);
          }
        }}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Creatinine Base Level:</Text>
      <TextInput
        style={styles.input}
        value={creatinineBaseLevel}
        onChangeText={setCreatinineBaseLevel}
        keyboardType="numeric"
        editable={false} // Disable editing
      />

      {/* Cancel Notification Button */}
      <TouchableOpacity
        style={[
          styles.cancelButton,
          isCancelButtonDisabled && styles.disabledButton,
        ]}
        onPress={handleCancelNotification}
        disabled={isCancelButtonDisabled}
      >
        <Text style={styles.buttonText}>Cancel Notification</Text>
      </TouchableOpacity>

      {/* Update Profile Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    marginTop: 20,
    textAlign: "center" 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginTop: 10 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "#0693e3",
    padding: 10,
    marginVertical: 10,
    width: "90%",
    borderRadius: 5,
    marginTop: 5,
    alignSelf: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: "center",
    borderRadius: 50,
  },
  cancelButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    marginVertical: 10,
    width: "90%",
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
});

export default ProfileScreen;