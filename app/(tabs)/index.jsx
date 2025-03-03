import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigation
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initializeDatabase } from '../../database';
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import OnboardingAge from "../screens/OnboardingAge";
import OnboardingRecurrence from "../screens/OnboardingRecurrence";
import OnboardingCreatinine from "../screens/OnboardingCreatinine";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

//handle logout
function CustomDrawerContent(props) {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const userId = props.state.routes[0].params?.userId;
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [userId]);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
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
      <View style={{ borderTopWidth: 1, borderTopColor: '#ccc' }}>
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
      />
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
          backgroundColor: '#fff',
          width: 240,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: 'black',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        initialParams={{ userId }}
        options={{ 
         
          headerShown: true
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        initialParams={{ userId }}
        options={{ 
          
          headerShown: true
        }}
      />
      <Drawer.Screen 
        name="Debug DB" 
        component={DebugScreen}
        initialParams={{ userId }}
        options={{ 
         
          headerShown: true
        }}
      />
    </Drawer.Navigator>
  );
}
// Create a Debug screen component
function DebugScreen() {
  const db = useSQLiteContext();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM users");
      console.log("All Users:", result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Check console for database contents</Text>
    </View>
  );
}

export default function App() {
  return (
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login"
          screenOptions={{
            headerTitle: "Creatinine Care",
            headerStyle: {
              backgroundColor: "#fff", 
            },
            headerTintColor: "black", 
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}>
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
              name="Home"
              component={HomeStack}
              options={{
                headerShown: false
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SQLiteProvider>
  );
}
