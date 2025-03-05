import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReportPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { report } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={{ uri: report.image_uri }} 
        style={styles.fullImage}
        resizeMode="contain"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Date: {report.formattedDate}</Text>
        <Text style={styles.detailText}>Month: {report.month}</Text>
        <Text style={styles.detailText}>Creatinine: {report.serumCreatinine}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  fullImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ReportPreviewScreen;