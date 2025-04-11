import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import UploadImage from "./UploadImage";
import { calculateAndUpdateBaseLevel } from "../../Database/dbHelpers";
import { MaterialIcons } from "@expo/vector-icons";

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
          message: " This report already exists! Please upload a new report.",
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient 
        colors={["#FFFFFF", "#E6F2FF"]} 
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.usernameText}>{username}!</Text>
        </View>

        <View style={styles.content}>
          <Image
            source={require("../../assets/images/app-icon.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />

          <UploadImage onImageUploaded={handleInsertReport} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => navigation.navigate("ReportHistory", { userId })}
            >
              <MaterialIcons name="history" size={24} color="white" />
              <Text style={styles.buttonText}> Report History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate("Chart", { userId })}
            >
              <MaterialIcons name="insert-chart" size={24} color="white" />
              <Text style={styles.buttonText}> Creatinine Trend</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.accentButton]}
              onPress={() => navigation.navigate("EGFR")}
            >
              <MaterialIcons name="calculate" size={24} color="white" />
              <Text style={styles.buttonText}>eGFR Calculator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3498db",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  usernameText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2c3e50",
    marginTop: 4,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  appIcon: {
    width: 150,
    height: 150,
    marginBottom: 32,
    borderRadius: 30,
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    padding: 16,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 24,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#2f6396",
  },
  secondaryButton: {
    backgroundColor: "#204263",
  },
  accentButton: {
    backgroundColor: "#163e59",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10, 
  },
});

export default HomeScreen;