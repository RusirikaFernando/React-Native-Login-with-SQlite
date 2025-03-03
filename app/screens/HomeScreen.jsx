import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, BackHandler, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backAction = () => {
      return true; // Prevents going back
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

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
  }
});

export default HomeScreen;
