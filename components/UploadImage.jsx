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

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");

      setExtractedData(data);
      setImage(uri);
      onImageUploaded(data);
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Report Image</Text>
      </TouchableOpacity>

      {/* Custom Styled Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Upload Requirements</Text>
            <Text style={styles.modalDescription}>
              Please ensure:
            </Text>
            <Text style={styles.modalText}>
              ✅ The uploaded file is a serum creatinine test report.{"\n"}
              ✅ The image has good lighting.{"\n"}
              ✅ The report contains the received date and creatinine value.
            </Text>

            {/* Modal Buttons */}
            <View style={styles.buttonContainer}>
              

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.okButton}
                onPress={selectImage}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Display Upload Progress and Image Preview */}
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Display Extracted Data */}
      {extractedData && (
        <View style={styles.dataContainer}>
          <Text>📅 Report Date: {extractedData.reportedDate}</Text>
          <Text>📆 Month: {extractedData.month}</Text>
          <Text>💉 Creatinine Level: {extractedData.serumCreatinine}</Text>
        </View>
      )}
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
    width: "30%"
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
