import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSQLiteContext } from 'expo-sqlite';
import { useRoute, useFocusEffect } from '@react-navigation/native';

const ChartScreen = () => {
  const db = useSQLiteContext();
  const { params } = useRoute();
  const userId = params?.userId;
  const [chartData, setChartData] = useState(null);
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

  const fetchChartData = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT 
          strftime('%Y-%m-%d', reportedDate) as date,
          serumCreatinine 
         FROM reports 
         WHERE user_id = ? 
         ORDER BY date ASC`,
        [userId]
      );

      if (results.length === 0) {
        setChartData(null);
        showAlert("No Data", "No reports available to generate chart", "#767577");
        return;
      }

      // Group data by month-year while preserving individual points
      const groupedData = results.reduce((acc, item) => {
        const date = new Date(item.date);
        const monthYear = date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric'
        });

        if (!acc[monthYear]) {
          acc[monthYear] = {
            label: monthYear,
            values: []
          };
        }

        acc[monthYear].values.push({
          date: item.date,
          value: parseFloat(item.serumCreatinine.toFixed(2))
        });

        return acc;
      }, {});

      // Convert to chart format
      const labels = Object.keys(groupedData);
      const dataPoints = Object.values(groupedData).map(group => 
        group.values[group.values.length - 1].value
      );
      
      setChartData({
        labels,
        datasets: [{
          data: dataPoints,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`, // Using #3498db
          strokeWidth: 3
        }]
      });
    } catch (error) {
      console.error("Chart data error:", error);
      showAlert("Error", "Failed to load chart data", "#e74c3c");
      setChartData(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchChartData();
    }, [userId])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creatinine Trend Analysis</Text>
        <View style={styles.headerDivider} />
      </View>

      {chartData ? (
        <>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={350}
              height={300}
              yAxisSuffix=" mg/dL"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`, // #3498db
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: 10
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#3498db'
                }
              }}
              bezier
              style={styles.chart}
              formatXLabel={(label) => {
                const date = new Date(label);
                if (isNaN(date.getTime())) return label;
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: '2-digit'
                });
              }}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Chart Interpretation Guide</Text>
            <View style={styles.infoItem}>
              <View style={[styles.colorIndicator, { backgroundColor: '#3498db' }]} />
              <Text style={styles.infoText}>
                <Text style={styles.bold}>Line Graph:</Text> Shows your creatinine level trend over time
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.colorIndicator, { backgroundColor: '#3498db' }]} />
              <Text style={styles.infoText}>
                <Text style={styles.bold}>X-Axis:</Text> Timeline (months/years)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.colorIndicator, { backgroundColor: '#3498db' }]} />
              <Text style={styles.infoText}>
                <Text style={styles.bold}>Y-Axis:</Text> Creatinine level (mg/dL)
              </Text>
            </View>
            <Text style={styles.note}>
              For optimal kidney health, aim to keep values in the normal range (0.6-1.2 mg/dL for adult males, 0.5-1.1 mg/dL for adult females).
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No creatinine reports available</Text>
          <Text style={styles.emptySubtext}>Add reports to see your trend analysis</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f7fa',
    paddingBottom: 30,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#3498db',
    width: '30%',
    alignSelf: 'center',
    marginTop: 10,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 15,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#767577',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
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
    borderRadius: 12,
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

export default ChartScreen;