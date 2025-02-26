import { SQLiteProvider } from "expo-sqlite";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initializeDatabase } from "../../database";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import OnboardingAge from "../screens/OnboardingAge";
import OnboardingRecurrence from "../screens/OnboardingRecurrence";
import OnboardingCreatinine from "../screens/OnboardingCreatinine";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerLeft: () => null,
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
                title: "Age",
                headerLeft: () => null,
                headerBackVisible: false, // Ensures no back button appears
              }}
            />
            <Stack.Screen
              name="OnboardingRecurrence"
              component={OnboardingRecurrence}
              options={{
                title: "Recurrence Period", // Sets the title in the header
               
              }}
            />
            <Stack.Screen
              name="OnboardingCreatinine"
              component={OnboardingCreatinine}
              options={{
                title: "Creatinine Base Level", // Sets the title in the header
               
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerLeft: () => null, // Removes the back arrow
                headerBackVisible: false, // Ensures no back button appears
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SQLiteProvider>
  );
}
