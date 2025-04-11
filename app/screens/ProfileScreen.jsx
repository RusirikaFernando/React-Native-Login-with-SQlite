import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ 
    title: "", 
    message: "", 
    color: "#3498db" 
  });

  // Show modal alert
  const showAlert = (title, message, color = "#3498db") => {
    setModalContent({ title, message, color });
    setModalVisible(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [newBaseLevel])
  );

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
      showAlert("Error", "Failed to load user data", "#e74c3c");
    }
  };

  useEffect(() => {
    if (newBaseLevel) {
      setCreatinineBaseLevel(newBaseLevel.toFixed(2));
    }
  }, [newBaseLevel]);

  const handleCancelNotification = async () => {
    if (!notificationId) {
      showAlert("Error", "No notification to cancel.", "#e74c3c");
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      showAlert("Success", "Notification canceled successfully.", "#27ae60");
      setNotificationId(null);
      setIsCancelButtonDisabled(true);
    } catch (error) {
      console.error("Error canceling notification:", error);
      showAlert("Error", "Failed to cancel notification.", "#e74c3c");
    }
  };

  const handleUpdateProfile = async () => {
    if (!username || !age || !recurrencePeriod) {
      showAlert("Error", "Username, age, and recurrence period are required.", "#e74c3c");
      return;
    }

    try {
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      const newNotificationId = await scheduleRecurringNotification2(
        parseInt(recurrencePeriod),
        userId
      );

      await db.runAsync(
        `UPDATE users 
         SET username = ?, 
             age = ?, 
             recurrence_period = ?, 
             notification_id = ?
         WHERE id = ?`,
        [username, age, recurrencePeriod, newNotificationId, userId]
      );

      setNotificationId(newNotificationId);
      setIsCancelButtonDisabled(false);
      showAlert("Success", "Profile updated successfully.", "#27ae60");
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Error", "Failed to update profile", "#e74c3c");
    }
  };

  const handleUpdateRecurrence = async (newPeriod) => {
    const period = parseInt(newPeriod);

    if (isNaN(period) || period < 1) {
      showAlert("Error", "Recurrence period must be at least 1 month.", "#e74c3c");
      return;
    }

    try {
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      const newNotificationId = await scheduleRecurringNotification2(period, userId);

      await db.runAsync(
        'UPDATE users SET recurrence_period = ?, notification_id = ? WHERE id = ?',
        [period, newNotificationId, userId]
      );

      setRecurrencePeriod(period.toString());
      setNotificationId(newNotificationId);
      setIsCancelButtonDisabled(false);
      showAlert("Success", "Reminder schedule updated successfully", "#27ae60");
    } catch (error) {
      console.error('Error updating reminder:', error);
      showAlert("Error", error.message || 'Failed to update reminder schedule', "#e74c3c");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={styles.headerDivider} />
      </View>

      {/* Form Section */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="#95a5a6"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="Enter your age"
          placeholderTextColor="#95a5a6"
        />

        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <Text style={styles.label}>Reminder Frequency (months)</Text>
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
          placeholder="e.g., 3"
          placeholderTextColor="#95a5a6"
        />

        <Text style={styles.label}>Creatinine Base Level</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={creatinineBaseLevel}
          editable={false}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            isCancelButtonDisabled && styles.disabledButton
          ]}
          onPress={handleCancelNotification}
          disabled={isCancelButtonDisabled}
        >
          <Text style={styles.buttonText}>Cancel Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleUpdateProfile}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Alert */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: modalContent.color }]}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalMessage}>{modalContent.message}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: modalContent.color }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
 
  formCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3498db",
    marginBottom: 16,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#3b3b3b",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#8e9394",
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#2c3e50",
  },
  disabledInput: {
    backgroundColor: "#f5f7fa",
    color: "#95a5a6",
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  cancelButton: {
    backgroundColor: "#27ae60",
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 24,
    borderTopWidth: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#7f8c8d",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});

export default ProfileScreen;