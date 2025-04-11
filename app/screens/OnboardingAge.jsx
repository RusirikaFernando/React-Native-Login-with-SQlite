import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Image,
  Modal,
  Pressable,
} from "react-native";

const OnboardingAge = ({ navigation, route }) => {
  const [alertVisible, setAlertVisible] = useState(false);


  useEffect(() => {
    const backAction = () => {
      return true; // Prevents going back
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  const { userId } = route.params;
  const [age, setAge] = useState("");

  const handleNext = () => {
    if (!age) {
      setAlertVisible(true);
      return;
    }
    navigation.navigate("OnboardingRecurrence", { userId, age });
  };

  return (
    <View style={styles.container}>
      {/* App Icon */}
      <Image source={require("../../assets/images/app-icon.png")} style={styles.icon} />

      {/* Welcome Message */}
      <Text style={styles.welcomeText}>Creatinine Care</Text>
      <Text style={styles.title}>Enter the patient's Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
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
            <Text style={styles.alertMessage}>Please enter the patient's age.</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setAlertVisible(false)}
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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
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
  nextButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "#800080",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: "30%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
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
});

export default OnboardingAge;
