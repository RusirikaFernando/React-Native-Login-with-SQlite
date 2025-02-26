import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, BackHandler } from "react-native";

const OnboardingAge = ({ navigation, route }) => {

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
      alert("Please enter your age");
      return;
    }
    navigation.navigate("OnboardingRecurrence", { userId, age });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <View style={styles.buttonContainer}>
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 20 },
  input: { borderWidth: 1, width: "80%", padding: 10, marginBottom: 20 },
  buttonContainer: { marginTop: 20 },
});

export default OnboardingAge;
