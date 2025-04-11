import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const LoginScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Simple hash function
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const handleLogin = async () => {
    if (userName.length === 0 || password.length === 0) {
      setModalVisible("empty");
      return;
    }
    try {
      const user = await db.getFirstAsync(
        `SELECT * FROM users WHERE username = ? AND password = ?`,
        [userName, simpleHash(password)]
      );

      if (user) {
        setModalVisible("success");
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("Home", { userId: user.id });
          setUserName("");
          setPassword("");
        }, 1200); // delay before navigating
      } else {
        setModalVisible("invalid");
      }
    } catch (error) {
      console.log("Error during login:", error);
      setModalVisible("fail");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/app-icon.png")}
        style={styles.icon}
      />
      <Text style={styles.welcomeText}>Welcome to Creatinine Care</Text>
      <Text style={styles.title}>Login</Text>

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

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable style={styles.link} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </Pressable>

      {/* Success & Error Modal */}
      <Modal
        visible={modalVisible !== false}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.alertBox,
              modalVisible === "success"
                ? styles.successBorder
                : styles.errorBorder,
            ]}
          >
            <Text
              style={[
                styles.alertTitle,
                modalVisible === "success"
                  ? styles.successText
                  : styles.errorText,
              ]}
            >
              {modalVisible === "success"
                ? "Login Successful"
                : modalVisible === "invalid"
                ? "Invalid Credentials"
                : modalVisible === "empty"
                ? "Missing Fields"
                : "Login Failed"}
            </Text>
            <Text style={styles.alertMessage}>
              {modalVisible === "success"
                ? "Welcome back!"
                : modalVisible === "invalid"
                ? "Invalid username or password."
                : modalVisible === "empty"
                ? "Please fill in all fields."
                : "Something went wrong. Please try again."}
            </Text>

            {modalVisible !== "success" && (
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>OK</Text>
              </Pressable>
            )}
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

  // Modal Styles
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
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  successBorder: {
    borderColor: "#27ae60",
  },
  errorBorder: {
    borderColor: "#e74c3c",
  },
  successText: {
    color: "#27ae60",
  },
  errorText: {
    color: "#e74c3c",
  },
});

export default LoginScreen;
