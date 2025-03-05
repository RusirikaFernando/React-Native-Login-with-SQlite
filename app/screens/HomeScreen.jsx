import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import UploadImage from "../../components/UploadImage";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  const handleInsertReport = async (reportData) => {
    try {
      const existingReport = await db.getFirstAsync(
        `SELECT report_id FROM reports 
         WHERE user_id = ? 
           AND reportedDate = ? 
           AND serumCreatinine = ?`,
        [userId, reportData.reportedDate, reportData.serumCreatinine]
      );

      if (existingReport) {
        return {
          success: false,
          message: "⚠️ This report already exists!\nPlease upload a new report.",
        };
      }

      await db.runAsync(
        `INSERT INTO reports (user_id, reportedDate, month, serumCreatinine, image_uri) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          reportData.reportedDate,
          reportData.month,
          reportData.serumCreatinine,
          reportData.image_uri
        ]
      );

      return {
        success: true,
        message: "✅ Report saved successfully!",
      };
    } catch (error) {
      console.error("Database error:", error);
      return {
        success: false,
        message: "❌ Failed to save report. Please try again.",
      };
    }
  };

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
      <UploadImage onImageUploaded={handleInsertReport} />
      
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('ReportHistory', { userId })}
      >
        <Text style={styles.historyButtonText}>View Report History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
  },
  userText: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: "#800080",
  },
  historyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  historyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;