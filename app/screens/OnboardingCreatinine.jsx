import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as Notifications from "expo-notifications"; // Import Notifications

const OnboardingCreatinine = ({ navigation, route }) => {
  const db = useSQLiteContext();
  const { userId, age, recurrence, notificationId } = route.params; // Destructure params
  const [creatinine, setCreatinine] = useState(""); // Define creatinine state
  const [alertVisible, setAlertVisible] = useState(false); // Error Modal
  const [successVisible, setSuccessVisible] = useState(false); // Success Modal

  const handleFinish = async () => {
    if (!creatinine) {
      setAlertVisible(true);
      return;
    }

    try {
      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🩺 Checkup Reminder",
          body: "Time for your creatinine test!",
        },
        trigger: {
          date: new Date(Date.now() + recurrence * 30 * 24 * 60 * 60 * 1000), // Convert months to milliseconds
          repeats: true,
        },
      });

      // Update the database
      await db.runAsync(
        `UPDATE users 
         SET age = ?, 
             recurrence_period = ?, 
             creatinine_base_level = ?,
             notification_id = ?
         WHERE id = ?`,
        [age, recurrence, creatinine, notificationId, userId]
      );

      setSuccessVisible(true);
    } catch (error) {
      console.log("Database update error:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <View style={styles.container}>
      {/* App Icon */}
      <Image
        source={require("../../assets/images/app-icon.png")}
        style={styles.icon}
      />

      {/* Welcome Message */}
      <Text style={styles.welcomeText}>Creatinine Care</Text>
      <Text style={styles.title}>Enter Creatinine Base Level</Text>

      {/* Description */}
      <Text style={styles.description}>
        This is the average value of the patient's past creatinine tests. It
        helps us determine health trends and detect abnormalities.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g.   0.89 mg/dl"
        keyboardType="numeric"
        value={creatinine}
        onChangeText={setCreatinine} // Update creatinine state
      />

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      {/* Alert Modal */}
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, styles.warningBorder]}>
            <Text style={styles.alertTitle}>Attention</Text>
            <Text style={styles.alertMessage}>
              Please enter the patient's base creatinine level.
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setAlertVisible(false)}
            >
              <Text style={styles.closeButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, styles.successBorder]}>
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.alertMessage}>Profile setup complete!</Text>
            <Pressable
              style={[styles.closeButton, styles.successButton]}
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate("Home", { userId });
              }}
            >
              <Text style={styles.closeButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    marginBottom: 30,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#8a8a8a",
    marginVertical: 5,
    borderRadius: 5,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginBottom: 60,
  },
  description: {
    fontSize: 14,
    color: "#767577",
    textAlign: "center",
    marginBottom: 15,
    marginHorizontal: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    marginTop: -150,
  },
  finishButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "#800080",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    backgroundColor: "#990000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: "30%",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
  },
  warningBorder: {
    borderColor: "#e67e22",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#e67e22",
  },
  alertMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  successBorder: {
    borderColor: "#27ae60",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#27ae60",
  },
  successButton: {
    backgroundColor: "#27ae60",
  },
  
});

export default OnboardingCreatinine;
