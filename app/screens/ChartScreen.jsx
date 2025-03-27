import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSQLiteContext } from 'expo-sqlite';
import { useRoute, useFocusEffect } from '@react-navigation/native';

const ChartScreen = () => {
  const db = useSQLiteContext();
  const { params } = useRoute();
  const userId = params?.userId;
  const [chartData, setChartData] = useState(null);

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
          value: parseFloat(item.serumCreatinine.toFixed(2)) // Ensure 2 decimal places
        });

        return acc;
      }, {});

      // Convert to chart format
      const labels = Object.keys(groupedData);
      const dataPoints = Object.values(groupedData).map(group => 
        group.values[group.values.length - 1].value // Use last value in month
      );
      
      setChartData({
        labels,
        datasets: [{
          data: dataPoints,
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
          strokeWidth: 2
        }]
      });
    } catch (error) {
      console.error("Chart data error:", error);
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
      <Text style={styles.title}>Creatinine Level Trend (mg/dL)</Text>
      
      {chartData ? (
        <>
          <LineChart
            data={chartData}
            width={350}
            height={320}
            yAxisSuffix=" mg/dL"
            yAxisInterval={1} // Adjust interval based on your data range
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2, // Ensure 2 decimal places for Y-axis values
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForLabels: {
                fontSize: 10
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#800080'
              }
            }}
            bezier
            style={styles.chart}
            formatXLabel={(label) => {
              // Ensure proper label formatting
              const date = new Date(label);
              if (isNaN(date.getTime())) {
                return label; // Fallback to raw label if invalid date
              }
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                year: '2-digit'
              });
            }}
          />
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Understanding the Chart</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.boldText}>X-Axis (Horizontal):</Text> Represents the timeline, showing the months and years when the creatinine levels were recorded.
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.boldText}>Y-Axis (Vertical):</Text> Represents the creatinine levels in mg/dL. This axis shows the range of values for your creatinine levels over time.
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.boldText}>Dots:</Text> Each dot represents a specific creatinine level reading at a particular point in time. 
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.noData}>No reports available for chart</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 40,
    marginTop: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: -20,
  },
  noData: {
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  detailsContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  detailsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default ChartScreen;