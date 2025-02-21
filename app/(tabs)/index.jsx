import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View,TextInput} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { NavigationContainer , NavigationIndependentTree} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";


//initiatize the database
const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`PRAGMA journal_mode = WAL;
             CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT ); `
              ); 
              console.log('DATABASE INITIALIZED');

  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// create stack navigator

const Stack = createStackNavigator();


export default function App() {
  return (
   <SQLiteProvider databaseName="auth.db" onInit={initializeDatabase}>
       <NavigationIndependentTree>
     <NavigationContainer>
    <Stack.Navigator initialRouteName='Login'>
                <Stack.Screen name='Login' component={LoginScreen}/>
                <Stack.Screen name='Register' component={RegisterScreen}/>
                <Stack.Screen name='Home' component={HomeScreen}/>
            </Stack.Navigator>
            </NavigationContainer>
            </NavigationIndependentTree>
   </SQLiteProvider>
  );
}

//Login Screen component
const LoginScreen = ({navigation}) => {
return(
<View style= {styles.container}>
  <Text style={styles.title}>Login</Text>

  <TextInput
  style={styles.input}
  placeholder="Username"
  />

   <TextInput
  style={styles.input}
  placeholder="Password"
  secureTextEntry
  />

  <Pressable style={styles.button} onPress={()=> navigation.navigate('Home')}>
    <Text style={styles.buttonText}>Login</Text>
  </Pressable>

  <Pressable style={styles.link} onPress={()=> navigation.navigate('Register')}>
    <Text style={styles.linkText}>Don't have an account? Register</Text>
  </Pressable>
</View>
)
 
}

//Register Screen component
const RegisterScreen = ({navigation}) => {
return (
  <View style= {styles.container}>
    <Text style={styles.title}>Register</Text>
    <TextInput
  style={styles.input}
  placeholder="Username"
  />

   <TextInput
  style={styles.input}
  placeholder="Password"
  secureTextEntry
  />

  <TextInput
  style={styles.input}
  placeholder="Confirm Password"
  secureTextEntry
  />

<Pressable style={styles.button} onPress={()=> navigation.navigate('Home')}>
    <Text style={styles.buttonText}>Register</Text>
  </Pressable>

  <Pressable style={styles.link} onPress={()=> navigation.navigate('Login')}>
    <Text style={styles.linkText}>Already have an account? Login</Text>
  </Pressable>
  
  </View>
)
}

//HomeScreen component
const HomeScreen = () => {

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
    input:{
      width: '80%',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      marginVertical: 5,
      borderRadius: 5,
      

    },
    button:{
      backgroundColor: 'blue',
      padding: 10,
      marginVertical: 10,
      width: '80%',
      borderRadius: 5,

    },
    buttonText:{
      color: 'white',
      textAlign: 'center',
      fontSize: 18,
    },
    link:{
      marginTop: 10,
    },
    linkText:{
color: 'blue',
    },
});
