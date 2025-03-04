import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, BackHandler, TouchableOpacity,ActivityIndicator, 
  Image  } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permissions are required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      // Use your computer's IP address for physical device testing
      const response = await fetch('http://192.168.1.2:5000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      
      setExtractedData(data);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      return true; // Prevents going back
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Function to fetch username from database
  const fetchUsername = async () => {
    try {
      const result = await db.getFirstAsync(
        "SELECT username FROM users WHERE id = ?",
        [userId]
      );
      if (result) {
        setUsername(result.username); // Update state with fetched username
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    } finally {
      setLoading(false);  // Set loading to false when done
    }
  };

  // Fetch username when the component loads
  useEffect(() => {
    fetchUsername();
  }, []);

  return (
    <View style={styles.container}>
      {/* Existing welcome message */}
      <Text style={styles.userText}>Welcome {username || 'User'}!</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Report Image</Text>
      </TouchableOpacity>

      {uploading && <ActivityIndicator size="large" color="#0000ff" />}

      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : extractedData && (
        <View style={styles.dataContainer}>
          <Text>Report Date: {extractedData.reportedDate}</Text>
          <Text>Month: {extractedData.month}</Text>
          <Text>Creatinine Level: {extractedData.serumCreatinine}</Text>
        </View>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  userText: {
    fontSize: 18,
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '80%',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeScreen;
