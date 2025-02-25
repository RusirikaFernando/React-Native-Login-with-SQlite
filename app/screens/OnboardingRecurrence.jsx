import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const OnboardingRecurrence = ({ navigation, route }) => {
  const { userId, age } = route.params;
  const [recurrence, setRecurrence] = useState("");

  const handleNext = () => {
    if (!recurrence) {
      alert("Please enter recurrence period");
      return;
    }
    navigation.navigate("OnboardingCreatinine", { userId, age, recurrence });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Recurrence Period</Text>
      <TextInput
        style={styles.input}
        placeholder="Number of months"
        keyboardType="numeric"
        value={recurrence}
        onChangeText={setRecurrence}
      />
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={() => navigation.goBack()} />
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 20 },
  input: { borderWidth: 1, width: "80%", padding: 10, marginBottom: 20 },
  buttonContainer: { flexDirection: "row", gap: 10 },
});

export default OnboardingRecurrence;
