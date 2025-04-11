import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [alertContent, setAlertContent] = useState({
    title: "",
    message: "",
    color: "#3498db"
  });

  const showAlert = (title, message, color = "#3498db") => {
    setAlertContent({ title, message, color });
    setModalVisible(true);
  };

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
      showAlert("Error", "Failed to load reports", "#e74c3c");
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
      showAlert("Success", "Report deleted successfully", "#27ae60");
      await calculateAndUpdateBaseLevel(db, userId);
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("Error", "Failed to delete report", "#e74c3c");
    }
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('ReportPreview', { report: item })}
        style={styles.reportContent}
      >
        <View style={styles.reportDetails}>
          <Text style={styles.reportDate}>{item.formattedDate}</Text>
          <Text style={styles.reportMonth}>Month: {item.month}</Text>
          <Text style={styles.reportCreatinine}>
            Creatinine: <Text style={styles.creatinineValue}>{item.serumCreatinine} mg/dL</Text>
          </Text>
        </View>
        
        <View style={styles.imageSection}>
          {item.image_uri ? (
            <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          setSelectedReport(item);
          showAlert("Confirm Delete", `Delete report from ${item.formattedDate}?`, "#e74c3c");
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report History</Text>
        <View style={styles.headerDivider} />
      </View>

      {reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.report_id.toString()}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No reports available</Text>
          <Text style={styles.emptySubtext}>Add your first report to see history</Text>
        </View>
      )}

      {/* Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: alertContent.color }]}>
            <Text style={styles.modalTitle}>{alertContent.title}</Text>
            <Text style={styles.modalMessage}>{alertContent.message}</Text>
            
            {alertContent.title === "Confirm Delete" && (
              <Text style={styles.reportDetails}>
                Creatinine: {selectedReport?.serumCreatinine} mg/dL
              </Text>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Dismiss</Text>
              </TouchableOpacity>
              
              {alertContent.title === "Confirm Delete" && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setModalVisible(false);
                    handleDeleteReport(selectedReport?.report_id, selectedReport?.image_uri);
                  }}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
  headerDivider: {
    height: 2,
    backgroundColor: "#3498db",
    width: "30%",
    alignSelf: "center",
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportDetails: {
    flex: 1,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  reportMonth: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  reportCreatinine: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  creatinineValue: {
    color: "#3498db",
    fontWeight: "600",
  },
  imageSection: {
    marginLeft: 16,
    alignItems: "center",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#95a5a6",
    fontSize: 12,
  },
  deleteButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f8d7da",
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#dc3545",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#767577",
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    borderTopWidth: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#7f8c8d",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  reportDetails: {
    fontSize: 14,
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  confirmButton: {
    backgroundColor: "#dc3545",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ReportHistoryScreen;