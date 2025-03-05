import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const UploadImage = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pickImage = () => {
    setModalVisible(true);
  };

  const selectImage = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Camera roll permissions are required!");
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

  const processExtractedData = (rawData) => {
    try {
      // Validate and parse date
      const dateParts = rawData.reportedDate.split('/');
      if (dateParts.length !== 3) throw new Error("Invalid date format");
      
      const [day, month, year] = dateParts;
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      // Validate and parse creatinine value
      const creatinineValue = parseFloat(rawData.serumCreatinine);
      if (isNaN(creatinineValue)) throw new Error("Invalid creatinine value");
      
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

      const processedData = processExtractedData(responseData);
      
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
      await onImageUploaded(extractedData);
      setShowConfirmation(false);
      setImage(null);
      setExtractedData(null);
      alert("Report saved successfully!");
    } catch (error) {
      setError("Failed to save report. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Report Image</Text>
      </TouchableOpacity>

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
              ✅ The report contains the received date and creatinine value.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.okButton} onPress={selectImage}>
                <Text style={styles.okButtonText}>OK</Text>
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
    backgroundColor: "red",
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
});

export default UploadImage;
