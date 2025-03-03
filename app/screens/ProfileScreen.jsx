import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const ProfileScreen = ({ route }) => {
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [recurrencePeriod, setRecurrencePeriod] = useState("");
  const [creatinineBaseLevel, setCreatinineBaseLevel] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user data from SQLite
  const fetchUserData = async () => {
    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );
      if (user) {
        setUsername(user.username);
        setAge(user.age ? String(user.age) : "");
        setRecurrencePeriod(user.recurrence_period ? String(user.recurrence_period) : "");
        setCreatinineBaseLevel(user.creatinine_base_level ? String(user.creatinine_base_level) : "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!username || !age || !recurrencePeriod || !creatinineBaseLevel) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE users 
         SET username = ?, age = ?, recurrence_period = ?, creatinine_base_level = ? 
         WHERE id = ?`,
        [username, age, recurrencePeriod, creatinineBaseLevel, userId]
      );
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image
        source={require("../../assets/images/user.jpg")}
        style={styles.icon}
      />

      <Text style={styles.label}>Username:</Text>
      <TextInput 
        style={styles.input} 
        value={username} 
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Age:</Text>
      <TextInput 
        style={styles.input} 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric"
      />

      <Text style={styles.label}>Recurrence Period (months):</Text>
      <TextInput
        style={styles.input}
        value={recurrencePeriod}
        onChangeText={setRecurrencePeriod}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Creatinine Base Level:</Text>
      <TextInput
        style={styles.input}
        value={creatinineBaseLevel}
        onChangeText={setCreatinineBaseLevel}
        keyboardType="numeric"
      />

<TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    marginTop: 20,
    textAlign: "center" 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginTop: 10 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "blue",
    padding: 10,
    marginVertical: 10,
    width: "90%",
    borderRadius: 5,
    marginTop: 110,
    alignSelf: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: "center",
    borderRadius: 50,
  },
});

export default ProfileScreen;
