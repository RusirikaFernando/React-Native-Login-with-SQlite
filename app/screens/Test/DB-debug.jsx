import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";

// Create a Debug screen component
function DebugScreen() {
  const db = useSQLiteContext();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch and display users with detailed information
      console.log("\n=== USERS TABLE DATA ===");
      const users = await db.getAllAsync(`
        SELECT 
          id,
          username,
          age,
          recurrence_period,
          creatinine_base_level,
          notification_id
        FROM users
        ORDER BY id
      `);

      if (users.length === 0) {
        console.log("No users found in database");
      } else {
        // Manually format users data into a table
        console.log(
          "ID  | Username      | Age | Recurrence | Creatinine | Notification ID"
        );
        console.log(
          "----|---------------|-----|------------|------------|----------------"
        );
        users.forEach((user) => {
          console.log(
            `${(user.id || "N/A").toString().padEnd(3)} | ${(user.username || "N/A").padEnd(
              13
            )} | ${(user.age || "N/A").toString().padEnd(3)} | ${(
              user.recurrence_period || "N/A"
            )
              .toString()
              .padEnd(10)} | ${(user.creatinine_base_level || "N/A")
              .toString()
              .padEnd(10)} | ${user.notification_id || "N/A"}`
          );
        });
      }

      // Fetch and display reports with detailed information
      console.log("\n=== REPORTS TABLE DATA ===");
      const reports = await db.getAllAsync(`
        SELECT 
          r.report_id,
          r.user_id,
          u.username,
          r.reportedDate,
          r.month,
          r.serumCreatinine,
          r.image_uri
        FROM reports r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.reportedDate DESC
      `);

      if (reports.length === 0) {
        console.log("No reports found in database");
      } else {
        // Manually format reports data into a table
        console.log(
          "Report ID | User ID | Username      | Date       | Month    | Creatinine | Image URI"
        );
        console.log(
          "----------|---------|---------------|------------|----------|------------|----------"
        );
        reports.forEach((report) => {
          console.log(
            `${(report.report_id || "N/A").toString().padEnd(9)} | ${(
              report.user_id || "N/A"
            )
              .toString()
              .padEnd(7)} | ${(report.username || "N/A").padEnd(13)} | ${
              report.reportedDate || "N/A"
            } | ${(report.month || "N/A").padEnd(8)} | ${(
              report.serumCreatinine || "N/A"
            )
              .toString()
              .padEnd(10)} | ${report.image_uri || "N/A"}`
          );
        });
      }

      // Show total counts
      console.log(`\nTotal Users: ${users.length}`);
      console.log(`Total Reports: ${reports.length}`);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.message);
    }
  };

  const clearDatabase = async () => {
    try {
      await db.execAsync(`
        DELETE FROM users;
        DELETE FROM reports;
      `);
      Alert.alert("Success", "Database cleared successfully.");
      fetchAllData(); // Refresh the data after clearing
    } catch (error) {
      console.error("Error clearing database:", error);
      Alert.alert("Error", "Failed to clear database.");
    }
  };
  
  

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Check console for database contents</Text>
      <TouchableOpacity
        onPress={fetchAllData}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "#007AFF",
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white" }}>Refresh Data</Text>
      </TouchableOpacity>
     
  <TouchableOpacity
    onPress={clearDatabase}
    style={{
      marginTop: 20,
      padding: 10,
      backgroundColor: "#FF0000", // Red color for destructive action
      borderRadius: 5,
    }}
  >
    <Text style={{ color: "white" }}>Clear Database</Text>
  </TouchableOpacity>
    </View>
  );
}

export default DebugScreen;