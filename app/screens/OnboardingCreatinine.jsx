import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as Notifications from "expo-notifications"; // Import Notifications

const OnboardingCreatinine = ({ navigation, route }) => {
  const db = useSQLiteContext();
  const { userId, age, recurrence, notificationId } = route.params; // Destructure params
  const [creatinine, setCreatinine] = useState(""); // Define creatinine state

  const handleFinish = async () => {
    if (!creatinine) {
      Alert.alert("Error", "Please enter the creatinine base level.");
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

      Alert.alert("Success", "Profile setup complete!");
      navigation.navigate("Home", { userId });
    } catch (error) {
      console.log("Database update error:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <View style={styles.container}>
      {/* App Icon */}
      <Image
        source={require("../../assets/images/app-icon.jpg")}
        style={styles.icon}
      />

      {/* Welcome Message */}
      <Text style={styles.welcomeText}>Creatinine Care</Text>
      <Text style={styles.title}>Enter Creatinine Base Level</Text>
      <TextInput
        style={styles.input}
        placeholder="Base Creatinine Level"
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
    borderColor: "#ccc",
    marginVertical: 5,
    borderRadius: 5,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginBottom: 60,
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
});

export default OnboardingCreatinine;