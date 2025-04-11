import React, { useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  BackHandler,
  Modal,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const RegisterScreen = ({ navigation }) => {
  const db = useSQLiteContext();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info", // success, error, warning
  });

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const showAlert = (title, message, type) => {
    setAlert({ visible: true, title, message, type });
  };

  const handleRegister = async () => {
    if (!userName || !password || !confirmPassword) {
      showAlert("Attention!", "Please enter all the fields.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match", "error");
      return;
    }

    try {
      const existingUser = await db.getFirstAsync(
        `SELECT * FROM users WHERE username = ?`,
        [userName]
      );
      if (existingUser) {
        showAlert("Error", "Username already exists!", "error");
        return;
      }

      const hashedPassword = simpleHash(password);

      const result = await db.runAsync(
        `INSERT INTO users (username, password, age, recurrence_period, creatinine_base_level) VALUES (?, ?, ?, ?, ?)`,
        [userName, hashedPassword, null, null, null]
      );

      showAlert(
        "Success",
        "Registration Successful! Few more steps to go.",
        "success"
      );

      setTimeout(() => {
        setAlert((prev) => ({ ...prev, visible: false }));
        navigation.navigate("OnboardingAge", {
          userId: result.lastInsertRowId,
        });
      }, 1500);
    } catch (error) {
      console.log("Error during registration:", error);
      showAlert("Error", "Registration failed. Please try again.", "error");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/app-icon.png")}
        style={styles.icon}
      />
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
      <Pressable style={styles.link} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>

      {/* Custom Modal Alert */}
      <Modal
        visible={alert.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.alertBox,
              alert.type === "error" && styles.errorBorder,
              alert.type === "success" && styles.successBorder,
              alert.type === "warning" && styles.warningBorder,
            ]}
          >
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setAlert((prev) => ({ ...prev, visible: false }))}
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
    backgroundColor: "#3498db",
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
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "white",
    padding: 20,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  errorBorder: {
    borderColor: "#e74c3c",
  },
  successBorder: {
    borderColor: "#2ecc71",
  },
  warningBorder: {
    borderColor: "#e67e22",
  },
});

export default RegisterScreen;
