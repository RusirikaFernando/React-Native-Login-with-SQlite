import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  TouchableOpacity
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const ReportPreviewScreen = () => {
  const route = useRoute();
  const { report } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    color: '#3498db'
  });

  const showAlert = (title, message, color = '#3498db') => {
    setModalContent({ title, message, color });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Details</Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Report Image */}
        <View style={styles.imageContainer}>
          {report.image_uri ? (
            <Image 
              source={{ uri: report.image_uri }} 
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No Report Image Available</Text>
            </View>
          )}
        </View>

        {/* Report Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Test Results</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{report.formattedDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Month:</Text>
            <Text style={styles.detailValue}>{report.month}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Creatinine Level:</Text>
            <Text style={[styles.detailValue, styles.creatinineValue]}>
              {report.serumCreatinine} mg/dL
            </Text>
          </View>
        </View>

        {/* Interpretation Guide */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Understanding Your Results</Text>
          <Text style={styles.infoText}>
            Normal creatinine levels typically range between:
          </Text>
          <Text style={styles.infoText}>
            • 0.6-1.2 mg/dL for adult males
          </Text>
          <Text style={styles.infoText}>
            • 0.5-1.1 mg/dL for adult females
          </Text>
          <Text style={styles.infoNote}>
            Consult your doctor for personalized interpretation of these results.
          </Text>
        </View>
      </ScrollView>

      {/* Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: modalContent.color }]}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalMessage}>{modalContent.message}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: modalContent.color }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    paddingBottom: 30,
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
  imageContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: 300,
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noImageText: {
    color: '#95a5a6',
    fontSize: 16,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  creatinineValue: {
    color: '#3498db',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
    lineHeight: 22,
  },
  infoNote: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 24,
    borderTopWidth: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ReportPreviewScreen;