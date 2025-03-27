import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import UploadImage from "../../components/UploadImage";
import { calculateAndUpdateBaseLevel } from "../../Database/dbHelpers";


const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("User");
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
          message: "⚠️ This report already exists! Please upload a new report.",
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
          reportData.image_uri,
        ]
      );

      const newBaseLevel = await calculateAndUpdateBaseLevel(db, userId);
      navigation.setParams({ newBaseLevel });
      navigation.navigate("Chart", { userId, refresh: Date.now() });

      return {
        success: true,
        message: "✅ Report saved successfully!",
        baseLevel: newBaseLevel,
        currentValue: reportData.serumCreatinine,
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
      if (result) {
        setUsername(result.username);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchUsername = useCallback(fetchUsername, [db, userId]);

  useEffect(() => {
    memoizedFetchUsername();
  }, [memoizedFetchUsername]);

  return (
    <LinearGradient colors={["#f9f9f9", "#e0e0ff"]} style={styles.container}>
      <Text style={styles.userText}>Welcome, {username}!</Text>
      <Image source={require("../../assets/images/app-icon.jpg")} style={styles.icon} />
      <UploadImage onImageUploaded={handleInsertReport} />

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("ReportHistory", { userId })}
      >
        <Text style={styles.historyButtonText}>View Report History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.historyButton, { backgroundColor: "#6A5ACD" }]}
        onPress={() => navigation.navigate("Chart", { userId })}
      >
        <Text style={styles.historyButtonText}>View Creatinine Trend</Text>
      </TouchableOpacity>


    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  userText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6A5ACD",
    marginBottom: 20,
  },
  historyButton: {
    backgroundColor: "#4682B4",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    elevation: 5,
  },
  historyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  
});

export default HomeScreen;
