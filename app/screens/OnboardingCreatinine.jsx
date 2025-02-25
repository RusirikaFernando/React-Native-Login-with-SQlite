import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const OnboardingCreatinine = ({ navigation, route }) => {
  const db = useSQLiteContext();
  const { userId, age, recurrence } = route.params;
  const [creatinine, setCreatinine] = useState("");

  const handleFinish = async () => {
    try {
      await db.runAsync(
        `UPDATE users SET age = ?, recurrence_period = ?, creatinine_base_level = ? WHERE id = ?`,
        [age, recurrence, creatinine || null, userId]
      );

      Alert.alert("Success", "Profile setup complete!");
      navigation.navigate("Home", {userId});
    } catch (error) {
      console.log("Database update error:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Creatinine Base Level (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Creatinine Level (Optional)"
        keyboardType="numeric"
        value={creatinine}
        onChangeText={setCreatinine}
      />
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={() => navigation.goBack()} />
        <Button title="Finish" onPress={handleFinish} />
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

export default OnboardingCreatinine;
