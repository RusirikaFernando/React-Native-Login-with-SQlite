import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, BackHandler, FlatList } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import UploadImage from "../../components/UploadImage";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT 
          report_id,
          strftime('%d/%m/%Y', reportedDate) as formattedDate,
          month,
          serumCreatinine 
         FROM reports 
         WHERE user_id = ? 
         ORDER BY reportedDate DESC`,
        [userId]
      );
      setReports(results);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };


    const handleInsertReport = async (reportData) => {
    try {
      await db.runAsync(
        "INSERT INTO reports (user_id, reportedDate, month, serumCreatinine) VALUES (?, ?, ?, ?)",
        [userId, reportData.reportedDate, reportData.month, reportData.serumCreatinine]
      );
      await fetchReports();
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save report. Please try again.");
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
    fetchReports();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.userText}>Welcome {username || "User"}!</Text>
      <UploadImage onImageUploaded={handleInsertReport} />
      
      <Text style={styles.sectionTitle}>Previous Reports:</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.report_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reportItem}>
            <Text>Date: {item.formattedDate}</Text>
            <Text>Month: {item.month}</Text>
            <Text>Creatinine: {item.serumCreatinine}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No reports available</Text>}
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
  userText: { 
    fontSize: 18, 
    marginBottom: 20
   },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  reportItem: {
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 10,
    width: 300,
  },
});

export default HomeScreen;
