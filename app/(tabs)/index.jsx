import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  SQLiteProvider,
  useSQLiteContext,
} from "expo-sqlite";
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
import ChartScreen from "../screens/ChartScreen";
import NotificationTestScreen from "../screens/Test/NotificationTestScreen";
import DebugScreen from "../screens/Test/DB-debug";
import EGFRScreen from "../screens/eGFR";
import * as Notifications from "expo-notifications";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer with styled logout modal
function CustomDrawerContent(props) {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      const userId = props.state.routes[0].params?.userId;
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [userId]);
      setLogoutVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: "#ccc" }}>
        <DrawerItem label="Logout" onPress={() => setLogoutVisible(true)} />
      </View>

      {/* Logout Modal */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, styles.logoutBorder]}>
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.closeButton, styles.cancelButton]}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.closeButton, styles.logoutButton]}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.closeButtonText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

// Drawer stack
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
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId }}
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="Debug DB"
        component={DebugScreen}
        initialParams={{ userId }}
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="Notification Test"
        component={NotificationTestScreen}
        options={{ headerShown: true }}
      />
    </Drawer.Navigator>
  );
}

// App wrapper
export default function App() {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);

  return (
    <SQLiteProvider
      databaseName="auth.db"
      onInit={initializeDatabase}
      options={{
        enableDangerousRawSql: true,
        enableMultiDbAccess: true,
      }}
    >
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
              options={{ headerLeft: () => null, headerShown: true }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerLeft: () => null,
                headerBackVisible: false,
              }}
            />
            <Stack.Screen
              name="OnboardingAge"
              component={OnboardingAge}
              options={{
                headerLeft: () => null,
                headerBackVisible: false,
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
              options={{ title: "Report Details", headerShown: true }}
            />
            <Stack.Screen
              name="ReportHistory"
              component={ReportHistoryScreen}
              options={{ title: "Report History", headerShown: true }}
            />
            <Stack.Screen
              name="Chart"
              component={ChartScreen}
              options={{ title: "Creatinine Trend", headerShown: true }}
            />
            <Stack.Screen
              name="EGFR"
              component={EGFRScreen}
              options={{ title: "eGFR Calculator", headerShown: true }}
            />
            <Stack.Screen
              name="Home"
              component={HomeStack}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
  },
  logoutBorder: {
    borderColor: "#c0392b",
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#c0392b",
  },
  alertMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  logoutButton: {
    backgroundColor: "#c0392b",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
