import { View, Text, TouchableOpacity } from "react-native";
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
            creatinine_base_level
          FROM users
          ORDER BY id
        `);
  
        if (users.length === 0) {
          console.log("No users found in database");
        } else {
          users.forEach((user) => {
            console.log(`\nUser ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Age: ${user.age}`);
            console.log(`Recurrence Period: ${user.recurrence_period}`);
            console.log(`Base Creatinine: ${user.creatinine_base_level}`);
            console.log("------------------------");
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
            r.serumCreatinine
          FROM reports r
          JOIN users u ON r.user_id = u.id
          ORDER BY r.reportedDate DESC
        `);
  
        if (reports.length === 0) {
          console.log("No reports found in database");
        } else {
          reports.forEach((report) => {
            console.log(`\nReport ID: ${report.report_id}`);
            console.log(`User ID: ${report.user_id}`);
            console.log(`Username: ${report.username}`);
            console.log(`Date: ${report.reportedDate}`);
            console.log(`Month: ${report.month}`);
            console.log(`Creatinine Value: ${report.serumCreatinine}`);
            console.log("------------------------");
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
      </View>
    );
  };
  export default DebugScreen;