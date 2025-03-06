import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet ,TouchableOpacity,Image} from "react-native";
import { scheduleRecurringNotification } from "../../Services/notifications";

const OnboardingRecurrence = ({ navigation, route }) => {
  const { userId, age } = route.params;
  const [recurrence, setRecurrence] = useState("");

  const handleNext = () => {
    if (!recurrence) {
      alert("Please enter recurrence period");
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
       <Image source={require("../../assets/images/app-icon.jpg")} style={styles.icon} />

{/* Welcome Message */}
<Text style={styles.welcomeText}>Creatinine Care</Text>
      <Text style={styles.title}>Enter Test Recurrence Period</Text>
      <TextInput
        style={styles.input}
        placeholder="Number of months"
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

export default OnboardingRecurrence;
