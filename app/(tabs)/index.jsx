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
import ChartScreen from '../screens/ChartScreen';
import NotificationTestScreen from "../screens/Test/NotificationTestScreen";
import DebugScreen from "../screens/Test/DB-debug";
import * as Notifications from 'expo-notifications';

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
      <Drawer.Screen
        name="Notification Test"
        component={NotificationTestScreen}
        options={{
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
}


export default function App() {

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
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
              name="Chart"
              component={ChartScreen}
              options={{
                title: "Creatinine Trend",
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
