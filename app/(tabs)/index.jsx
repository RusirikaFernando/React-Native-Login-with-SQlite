import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initializeDatabase } from '../../database';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import OnboardingAge from '../screens/OnboardingAge';
import OnboardingRecurrence from '../screens/OnboardingRecurrence';
import OnboardingCreatinine from '../screens/OnboardingCreatinine';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name='Login' component={LoginScreen}/>
            <Stack.Screen name='Register' component={RegisterScreen}/>
            <Stack.Screen name='OnboardingAge' component={OnboardingAge} />
        <Stack.Screen name='OnboardingRecurrence' component={OnboardingRecurrence} />
        <Stack.Screen name='OnboardingCreatinine' component={OnboardingCreatinine} />
            <Stack.Screen name='Home' component={HomeScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SQLiteProvider>
  );
}