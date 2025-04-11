import React, { useState, useEffect } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const UploadImage = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const navigation = useNavigation();

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
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera access is required.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const selectFromGallery = async () => {
    try {
      setShowSourcePicker(false);
      setModalVisible(false);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery access is required.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery");
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
      const dataToSave = {
        ...extractedData,
        image_uri: image,
      };
  
      const result = await onImageUploaded(dataToSave);
      
      if (!result.success) {
        setShowConfirmation(false);
        setTimeout(() => {
          setError(result.message); // Show the error AFTER modal closes
        }, 300); // Give time for modal to fade out
        setImage(null);
        setExtractedData(null);
        return;
      }
      
      setShowConfirmation(false);
      setImage(null);
      setExtractedData(null);
  
      if (result.success) {
        setComparisonData({
          currentValue: result.currentValue,
          baseLevel: result.baseLevel,
        });
        setShowComparison(true);
      }
    } catch (error) {
      setShowConfirmation(false);
      setImage(null);
      setExtractedData(null);
      setError("Failed to save report. Please try again.");
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={pickImage}
      >
        <MaterialIcons name="upload-file" size={24} color="white" />
        <Text style={styles.buttonText}>Upload Report</Text>
      </TouchableOpacity>

      {/* Source Picker Modal */}
      <Modal transparent visible={showSourcePicker} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: "#3498db" }]}>
            <Text style={styles.modalTitle}>Select Source</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleSourceSelection("camera")}
            >
              <MaterialIcons name="photo-camera" size={22} color="white" />
              <Text style={styles.modalButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleSourceSelection("gallery")}
            >
              <MaterialIcons name="photo-library" size={22} color="white" />
              <Text style={styles.modalButtonText}>Gallery</Text>
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

      {/* Upload Requirements Model */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: "#3498db" }]}>
            <Text style={styles.modalTitle}>Upload Requirements</Text>

            <Text style={styles.modalText}>
              ✅ Only serum creatinine reports{"\n"}✅ Good lighting and clear
              text{"\n"}✅ Reported date & value should be visible
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton2, { backgroundColor: "#767577" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton2, { backgroundColor: "#3498db" }]}
                onPress={
                  selectedSource === "camera" ? captureImage : selectFromGallery
                }
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal transparent visible={showConfirmation} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: "#3498db" }]}>
            <Text style={styles.modalTitle}>Confirm Report Data</Text>

            {/* Image Preview */}
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}

            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationText}>
                📅 Date: {extractedData?.rawDate}
              </Text>
              <Text style={styles.confirmationText}>
                📆 Month: {extractedData?.month}
              </Text>
              <Text style={styles.confirmationText}>
                💉 Creatinine: {extractedData?.serumCreatinine} mg/dL
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: "#767577" }]}
                onPress={() => {
                  setShowConfirmation(false);
                  setExtractedData(null);
                  setImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Reupload</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.okButton, { backgroundColor: "#3498db" }]}
                onPress={handleConfirm}
              >
                <Text style={styles.okButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comparison Modal */}
      <Modal transparent visible={showComparison} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: "#3498db" }]}>
            <Text style={styles.modalTitle}>📈 Comparison Results</Text>

            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationText}>
                Base Creatinine: {comparisonData?.baseLevel.toFixed(2)} mg/dL
              </Text>
              <Text style={styles.confirmationText}>
                Current Report: {comparisonData?.currentValue} mg/dL
              </Text>
            </View>

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    comparisonData?.currentValue < comparisonData?.baseLevel
                      ? "#27ae60"
                      : "#e67e22",
                },
              ]}
            >
              {comparisonData?.currentValue < comparisonData?.baseLevel
                ? "✅ Your creatinine is under control. Great job!"
                : "⚠️ Your levels are above base. Consult your doctor."}
            </Text>

            <TouchableOpacity
              style={[styles.okButton, { marginTop: 20 }]}
              onPress={() => setShowComparison(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload Status */}
      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Processing your report...</Text>
        </View>
      )}

      {/* Error Alert */}
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={22} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 20, width: "100%" },

  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom:10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%", // Ensure same width as other buttons
  },
  primaryButton: {
    backgroundColor: "#3498db",
    marginBottom: -8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  modalText: {
    fontSize: 16,
    color: "#444",
    textAlign: "left",
    marginBottom: 20,
    lineHeight: 24,
  },

  modalButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton2: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    width: "40%",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: { color: "white", fontWeight: "bold", marginLeft: 10 },

  cancelButton: {
    backgroundColor: "#767577",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  cancelButtonText: { color: "white", fontWeight: "bold" },

  okButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  okButtonText: { color: "white", fontWeight: "bold" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },

  imagePreview: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginTop: 15,
    borderRadius: 10,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#ffe6e6",
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginLeft: 8,
  },

  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#32404a",
  },

  confirmPreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  dataPreview: {
    marginTop: 10,
    backgroundColor: "#ecf0f1",
    padding: 10,
    borderRadius: 10,
    width: "90%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    borderTopWidth: 3,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: "center",
  },
  confirmationBox: {
    backgroundColor: "#ecf0f1",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginVertical: 10,
  },

  confirmationText: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 6,
  },
});

export default UploadImage;
