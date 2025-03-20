import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Alert
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import { calculateAndUpdateBaseLevel } from "../../Database/dbHelpers";

const ReportHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const db = useSQLiteContext();
  const { userId } = route.params;
  
  const [reports, setReports] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT 
          report_id,
          strftime('%Y-%m-%d', reportedDate) as formattedDate,
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

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId, imageUri) => {
    try {
      await db.runAsync("DELETE FROM reports WHERE report_id = ?", [reportId]);
      
      if (imageUri) {
        try {
          await FileSystem.deleteAsync(imageUri, { idempotent: true });
        } catch (fileError) {
          console.log("Image deletion error:", fileError);
        }
      }
      
      await fetchReports();
      Alert.alert("Success", "Report deleted successfully!");
      await calculateAndUpdateBaseLevel(db, userId);
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete report. Please check your internet connection or try again later.");
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
          <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
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
      {/* Add the "Previous Report History" topic */}
      <Text style={styles.sectionTitle}>Previous Report History</Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.report_id.toString()}
        renderItem={renderReportItem}
        ListEmptyComponent={<Text>No reports found</Text>}
        contentContainerStyle={styles.listContent}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
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
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#800080', // Purple color
    marginTop: 30,
    marginBottom: 16,
    marginLeft: 16,
    textAlign:"center"
  },
  listContent: {
    padding: 16,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reportContent: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginBottom: 8,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
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
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#cccccc',
  },
  confirmDeleteButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ReportHistoryScreen;