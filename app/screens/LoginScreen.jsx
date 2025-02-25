import React, { useState } from "react";
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Alert, 
  Image 
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const LoginScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

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
      Alert.alert("Attention!", "Please enter both username and password");
      return;
    }
    try {
      const user = await db.getFirstAsync(
        `SELECT * FROM users WHERE username = ? AND password = ?`,
        [userName, simpleHash(password)]
      );

      if (user) {
        Alert.alert("Success", "Login Successful");
        navigation.navigate("Home", { userId: user.id });
        setUserName("");
        setPassword("");
      } else {
        Alert.alert("Error", "Invalid username or password!");
      }
    } catch (error) {
      console.log("Error during login:", error);
      Alert.alert("Error", "Login failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* App Icon */}
      <Image source={require("../../assets/images/app-icon.jpg")} style={styles.icon} />

      {/* Welcome Message */}
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

export default LoginScreen;
