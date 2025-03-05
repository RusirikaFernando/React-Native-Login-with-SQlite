import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Image 
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import UploadImage from "../../components/UploadImage";
import * as FileSystem from 'expo-file-system';

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = route.params;
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT 
          report_id,
          strftime('%d/%m/%Y', reportedDate) as formattedDate,
          month,
          serumCreatinine,
          image_uri
         FROM reports 
         WHERE user_id = ? 
         ORDER BY reportedDate DESC`,
        [userId]
      );
      setReports(results);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleInsertReport = async (reportData) => {
    try {
      const existingReport = await db.getFirstAsync(
        `SELECT report_id FROM reports 
         WHERE user_id = ? 
           AND reportedDate = ? 
           AND serumCreatinine = ?`,
        [userId, reportData.reportedDate, reportData.serumCreatinine]
      );

      if (existingReport) {
        return {
          success: false,
          message:
            "⚠️ This report already exists!\nPlease upload a new report.",
        };
      }

      // Insert report with image_uri
      await db.runAsync(
        `INSERT INTO reports (user_id, reportedDate, month, serumCreatinine, image_uri) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          reportData.reportedDate,
          reportData.month,
          reportData.serumCreatinine,
          reportData.image_uri // Make sure this is passed from UploadImage
        ]
      );

      await fetchReports();
      return {
        success: true,
        message: "✅ Report saved successfully!",
      };
    } catch (error) {
      console.error("Database error:", error);
      return {
        success: false,
        message: "❌ Failed to save report. Please try again.",
      };
    }
  };

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const fetchUsername = async () => {
    try {
      const result = await db.getFirstAsync(
        "SELECT username FROM users WHERE id = ?",
        [userId]
      );
      if (result) setUsername(result.username);
    } catch (error) {
      console.error("Error fetching username:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsername();
    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId, imageUri) => {
    try {
      // Delete from database
      await db.runAsync(
        "DELETE FROM reports WHERE report_id = ?",
        [reportId]
      );
      
      // Only try to delete the image file if imageUri exists
      if (imageUri) {
        try {
          await FileSystem.deleteAsync(imageUri, { idempotent: true });
        } catch (fileError) {
          console.log("Image file deletion failed:", fileError);
          // Continue execution even if image deletion fails
        }
      }
      
      await fetchReports();
      Alert.alert("Success", "Report deleted successfully!");
    } catch (error) {
      console.error("Error deleting report:", error);
      Alert.alert("Error", "Failed to delete report. Please try again.");
    }
  };

  const confirmDelete = (report) => {
    setSelectedReport(report);
    setDeleteModalVisible(true);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.reportItem}
      onPress={() => navigation.navigate('ReportPreview', { report: item })}
    >
      <View style={styles.reportContent}>
        <Text>Date: {item.formattedDate}</Text>
        <Text>Month: {item.month}</Text>
        <Text>Creatinine: {item.serumCreatinine}</Text>
      </View>
      <View style={styles.imageContainer}>
        {item.image_uri ? (
          <Image 
            source={{ uri: item.image_uri }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.userText}>Welcome {username || "User"}!</Text>
      <UploadImage onImageUploaded={handleInsertReport} />
  
      <Text style={styles.sectionTitle}>Previous Reports:</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.report_id.toString()}
        renderItem={renderReportItem}
        ListEmptyComponent={<Text>No reports available</Text>}
      />
  
      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Report</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this report?
            </Text>
            <Text style={styles.reportDetails}>
              Date: {selectedReport?.formattedDate}
            </Text>
            <Text style={styles.reportDetails}>
              Creatinine: {selectedReport?.serumCreatinine}
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  handleDeleteReport(selectedReport?.report_id, selectedReport?.image_uri);
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  userText: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 20,
    fontWeight: 'bold',
    color:"#800080",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 10,
    width: 300,
  },
  reportContent: {
    flex: 1,
    marginRight: 10,
  },
  imageContainer: {
    alignItems: 'center',
    width: 60,  // Fixed width for the image container
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',  // Light background for loading state
  },
  placeholderImage: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
    marginTop: 2,
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  reportDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmDeleteButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
