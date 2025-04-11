import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet ,TouchableOpacity,Image, Modal, Pressable} from "react-native";

const OnboardingRecurrence = ({ navigation, route }) => {
  const { userId, age } = route.params;
  const [recurrence, setRecurrence] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleNext = () => {
    if (!recurrence) {
      setAlertVisible(true);
      return;
    }
  
    // Pass recurrence period to the next screen
    navigation.navigate("OnboardingCreatinine", {
      userId,
      age,
      recurrence: parseInt(recurrence), // Convert to number
    });
  };

  return (
    <View style={styles.container}>
       {/* App Icon */}
       <Image source={require("../../assets/images/app-icon.png")} style={styles.icon} />

{/* Welcome Message */}
<Text style={styles.welcomeText}>Creatinine Care</Text>
      <Text style={styles.title}>Enter Test Recurrence Period</Text>
      <Text style={styles.description}>
        This is the number of months until the patient’s next routine checkup.
        It helps us remind you on time.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2 months"
        keyboardType="numeric"
        value={recurrence}
        onChangeText={setRecurrence}
      />
{/* Next Button */}
<TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
            <Text style={styles.alertMessage}>Please enter recurrence period.</Text>
            <Pressable style={styles.closeButton} onPress={() => setAlertVisible(false)}>
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
    borderColor: "#9c9c9c",
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
  description: {
    fontSize: 14,
    color: "#767577",
    textAlign: "center",
    marginBottom: 20,
    marginHorizontal: 20,
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
});

export default OnboardingRecurrence;
