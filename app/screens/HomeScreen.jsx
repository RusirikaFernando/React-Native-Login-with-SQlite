import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, BackHandler } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import UploadImage from "../../components/UploadImage";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const fetchUsername = async () => {
    try {
      const result = await db.getFirstAsync(
        "SELECT username FROM users WHERE id = ?",
        [userId]
      );
      if (result) setUsername(result.username);
    } catch (error) {
      console.error("Error fetching username:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.userText}>Welcome {username || "User"}!</Text>
      <UploadImage
        onImageUploaded={(data) => console.log("Extracted Data:", data)}
      />
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
  userText: { fontSize: 18, marginBottom: 20 },
});

export default HomeScreen;
