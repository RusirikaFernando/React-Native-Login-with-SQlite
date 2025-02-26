import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, Alert, BackHandler } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const HomeScreen = ({ navigation, route }) => {
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
  const { userId } = route.params; // Get userId from navigation params
  const [username, setUsername] = useState(""); // State to store username
  const [loading, setLoading] = useState(true);  // Add loading state

  // Function to fetch username from database
  const fetchUsername = async () => {
    try {
      const result = await db.getFirstAsync(
        "SELECT username FROM users WHERE id = ?",
        [userId]
      );
      if (result) {
        setUsername(result.username); // Update state with fetched username
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    } finally {
      setLoading(false);  // Set loading to false when done
    }
  };

  // Fetch username when the component loads
  useEffect(() => {
    fetchUsername();
  }, []);


   // Function to fetch all users (for debugging)
   const fetchAllUsers = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM users");
      console.log("All Users:", result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  // Function to handle logout
  const handleLogout = async () => {
    try {
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [userId]); // Use userId instead of username
      Alert.alert("Success", "Logout Successful");
      navigation.navigate("Login");
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Text style={styles.userText}>
          Welcome {username || 'User'}!
        </Text>
      )}

      {/* Profile Button */}
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("Profile", { userId })}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </Pressable>

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
