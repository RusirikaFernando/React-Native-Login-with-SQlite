import React, { useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Image,
  BackHandler
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const RegisterScreen = ({ navigation }) => {
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

  const db = useSQLiteContext();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Simple hash function
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const handleRegister = async () => {
    if (
      userName.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      Alert.alert("Attention!", "Please enter all the fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const existingUser = await db.getFirstAsync(
        `SELECT * FROM users WHERE username = ?`,
        [userName]
      );
      if (existingUser) {
        Alert.alert("Error", "Username already exists!");
        return;
      }

      // Hash the password
      const hashedPassword = simpleHash(password);

      // Insert user with placeholders for additional data
      const result = await db.runAsync(
        `INSERT INTO users (username, password, age, recurrence_period, creatinine_base_level) VALUES (?, ?, ?, ?, ?)`,
        [userName, hashedPassword, null, null, null]
      );

      Alert.alert("Success", "Registration Successful");
      navigation.navigate("OnboardingAge", { userId: result.lastInsertRowId });
    } catch (error) {
      console.log("Error during registration:", error);
      Alert.alert("Error", "Registration failed. Please try again.");
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
      <Text style={styles.welcomeText}>Welcome to Creatinine Care</Text>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
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
  button: {
    backgroundColor: "blue",
    padding: 10,
    marginVertical: 10,
    width: "80%",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: "blue",
  },
});

export default RegisterScreen;
