import React from "react";
import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const HomeScreen = ({ navigation, route }) => {
  const db = useSQLiteContext();
  const { user } = route.params;

  const fetchAllUsers = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM users");
      console.log("All Users:", result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }; // If your database has multiple tables, repeat this function for each table.

    // Function to handle logout
    const handleLogout = async () => {
      try {
        // If you store session data, remove it (optional step)
        await db.runAsync(`DELETE FROM users WHERE username = ?`, [user]);
        Alert.alert("Success", "Logout Successful");
        navigation.navigate('Login');
      } catch (error) {
        console.log('Error during logout :', error);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.userText}>Welcome {user}!</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={fetchAllUsers}>
        <Text style={styles.buttonText}>Show Database in Console</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  userText: {
    fontSize: 18,
    marginBottom: 30,
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
});

export default HomeScreen;