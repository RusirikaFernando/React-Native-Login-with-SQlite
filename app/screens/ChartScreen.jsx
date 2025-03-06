import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        `SELECT reportedDate, serumCreatinine 
         FROM reports 
         WHERE user_id = ? 
         ORDER BY reportedDate ASC`,
        [userId]
      );

      if (results.length === 0) {
        setChartData(null);
        return;
      }

      const labels = results.map(item => 
        new Date(item.reportedDate).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      );

      const dataPoints = results.map(item => 
        parseFloat(item.serumCreatinine.toFixed(2))
      );

      setChartData({
        labels,
        datasets: [{
          data: dataPoints,
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`, // Purple color
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
    <View style={styles.container}>
      <Text style={styles.title}>Creatinine Level Trend (mg/dL)</Text>
      
      {chartData ? (
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
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#800080'
            }
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No reports available for chart</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 20
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  noData: {
    fontSize: 16,
    color: '#666',
    marginTop: 40
  }
});

export default ChartScreen;