import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const UploadImage = ({ onImageUploaded }) => {
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSourcePicker, setShowSourcePicker] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
  
    const pickImage = () => {
      setShowSourcePicker(true);
    };

    const handleSourceSelection = (source) => {
      setSelectedSource(source);
      setShowSourcePicker(false);
      setModalVisible(true);
    };

  const captureImage = async () => {
    try {
      setShowSourcePicker(false);
      setModalVisible(false);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      // Launch camera
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        
        quality: 1,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const selectFromGallery = async () => {
    try {
      setShowSourcePicker(false);
      setModalVisible(false);

      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos');
        return;
      }

      // Launch gallery
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        
        quality: 1,
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const processExtractedData = (rawData) => {
    try {
      // Validate and parse date
      const dateParts = rawData.reportedDate.split('/');
      if (dateParts.length !== 3) throw new Error("Invalid date format");
      
      const [day, month, year] = dateParts;
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      // Validate and parse creatinine value
      const creatinineValue = parseFloat(rawData.serumCreatinine);
      if (isNaN(creatinineValue)) throw new Error("Unable to capture the creatinine value correctly. Please try again.");
      
      // Format month name
      const formattedMonth = rawData.month.charAt(0).toUpperCase() + rawData.month.slice(1).toLowerCase();

      return {
        rawDate: rawData.reportedDate,
        reportedDate: isoDate,
        month: formattedMonth,
        serumCreatinine: creatinineValue
      };
    } catch (error) {
      throw new Error(`Data processing failed: ${error.message}`);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("avatar", { uri, name: "image.jpg", type: "image/jpeg" });

      const response = await fetch("http://192.168.1.2:5000/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Upload failed");

      const processedData = {
        ...processExtractedData(responseData),
        image_uri: uri 
      };
      
      setExtractedData(processedData);
      setImage(uri);
      setShowConfirmation(true);

    } catch (err) {
      setError(err.message || "Failed to process image");
      setImage(null);
      setExtractedData(null);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      // Make sure image_uri is included in the data
      const dataToSave = {
        ...extractedData,
        image_uri: image  // Add the image URI here
      };
      
      const result = await onImageUploaded(dataToSave);
      setShowConfirmation(false);
      setImage(null);
      setExtractedData(null);

      // Show comparison alert if successful
    if (result.success) {
      Alert.alert(
        "🟢 Health Status Update 🟢\n\n",
        `Current Level: ${result.currentValue} mg/dL\n` +
        `Base Level: ${result.baseLevel.toFixed(2)} mg/dL\n\n` +
        `${result.currentValue < result.baseLevel ? 
          "🎉 Great! Your levels are better than average!\n\n 📌 Keep it up... " : 
          "⚠️ Alert! Levels are above average. \n\n💧Stay Hydrated. try to drink more water."}`,
        [{ text: "OK" }]
      );
    }
      
      alert(result.message);
      
    } catch (error) {
      setShowConfirmation(false);
      setImage(null);
      setExtractedData(null);
      setError("Failed to save report. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Report</Text>
      </TouchableOpacity>

      {/* Source Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSourcePicker}
        onRequestClose={() => setShowSourcePicker(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Image Source</Text>
            
            <TouchableOpacity 
              style={styles.sourceButton1}
              onPress={() => handleSourceSelection('camera')}
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sourceButton2}
              onPress={() => handleSourceSelection('gallery')}
            >
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSourcePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload Requirements Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Upload Requirements</Text>
            <Text style={styles.modalDescription}>Please ensure:</Text>
            <Text style={styles.modalText}>
              ✅ The uploaded file is a serum creatinine test report.{"\n"}
              ✅ The image has good lighting.{"\n"}
              ✅ Make sure your image contains the received date and creatinine value.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.okButton} 
                onPress={selectedSource === 'camera' ? captureImage : selectFromGallery}
              >
                <Text style={styles.okButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmation}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Report Data</Text>
            <View style={styles.dataContainer}>
              <Text>📅 Report Date: {extractedData?.rawDate}</Text>
              <Text>📆 Month: {extractedData?.month}</Text>
              <Text>💉 Creatinine Level: {extractedData?.serumCreatinine}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: 'red' }]}
                onPress={() => {
                  setShowConfirmation(false);
                  setExtractedData(null);
                  setImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Reupload</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.okButton, { backgroundColor: 'green' }]}
                onPress={handleConfirm}
              >
                <Text style={styles.okButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Status */}
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 20 },

  // Upload Button
  uploadButton: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },

  // Modal Styling
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: "#444",
    textAlign: "left",
    alignSelf: "flex-start", // Align text to the left
    marginBottom: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensures buttons are properly spaced
    width: "100%",
    marginTop: 10,
  },

  cancelButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },

  okButton: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "40%"
  },

  okButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },

  // Image Preview
  imagePreview: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginTop: 15,
  },

  // Error Message
  errorText: { color: "red", marginTop: 10 },

  // Extracted Data Display
  dataContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    width: "80%",
  },
  sourceButton1: {
    backgroundColor: "#6A5ACD",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center'
  },
  sourceButton2: {
    backgroundColor: "#4682B4",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center'
  },
 
});

export default UploadImage;
