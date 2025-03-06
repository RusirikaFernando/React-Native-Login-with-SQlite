import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useEffect } from "react";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigation,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initializeDatabase } from "../../Database/database";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import OnboardingAge from "../screens/OnboardingAge";
import OnboardingRecurrence from "../screens/OnboardingRecurrence";
import OnboardingCreatinine from "../screens/OnboardingCreatinine";
import ProfileScreen from "../screens/ProfileScreen";
import ReportPreviewScreen from "../screens/ReportPreviewScreen";
import ReportHistoryScreen from "../screens/ReportHistoryScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

//handle logout
function CustomDrawerContent(props) {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              const userId = props.state.routes[0].params?.userId;
              await db.runAsync(`DELETE FROM users WHERE id = ?`, [userId]);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.log("Error during logout:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: "#ccc" }}>
        <DrawerItem label="Logout" onPress={handleLogout} />
      </View>
    </DrawerContentScrollView>
  );
}

// Create a Home stack that includes the drawer
function HomeStack({ route }) {
  const { userId } = route.params;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: "Creatinine Care",
        drawerStyle: {
          backgroundColor: "#fff",
          width: 240,
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "black",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ userId }}
        options={{
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId }}
        options={{
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="Debug DB"
        component={DebugScreen}
        initialParams={{ userId }}
        options={{
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
}
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
}

export default function App() {
  return (
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerTitle: "Creatinine Care",
              headerStyle: {
                backgroundColor: "#fff",
              },
              headerTintColor: "black",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerLeft: () => null,
                headerShown: true, // Ensure individual screen headers are shown
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerLeft: () => null,
                headerBackVisible: false, // Ensures no back button appears
              }}
            />
            <Stack.Screen
              name="OnboardingAge"
              component={OnboardingAge}
              options={{
                headerLeft: () => null,
                headerBackVisible: false, // Ensures no back button appears
              }}
            />
            <Stack.Screen
              name="OnboardingRecurrence"
              component={OnboardingRecurrence}
            />
            <Stack.Screen
              name="OnboardingCreatinine"
              component={OnboardingCreatinine}
            />
            <Stack.Screen
              name="ReportPreview"
              component={ReportPreviewScreen}
              options={{
                title: "Report Details",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="ReportHistory"
              component={ReportHistoryScreen}
              options={{
                title: "Report History",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeStack}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SQLiteProvider>
  );
}