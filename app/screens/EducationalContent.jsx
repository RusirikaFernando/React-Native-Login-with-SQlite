import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Text,Image  } from "react-native";
import { List, Divider, Card, useTheme } from "react-native-paper";

const EduContent = () => {
  const [expanded, setExpanded] = useState({});
  const { colors } = useTheme(); // Use theme colors for consistency

  const toggleExpand = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title Card */}
      <Card style={styles.titleCard}>
        <Card.Content>
          <Text style={styles.title}>Kidney Health & Creatinine Guide</Text>
        </Card.Content>
      </Card>
      <View style={styles.container2}>
      {/* App Icon */}
      <Image source={require("../../assets/images/app-icon.png")} style={styles.icon} />
      </View>
      {/* Understanding Kidney Health Section */}
      <Card style={styles.sectionCard}>
        <List.Accordion
          title=" Understanding Kidney Health"
          expanded={expanded.kidneyHealth}
          onPress={() => toggleExpand("kidneyHealth")}
          left={(props) => <List.Icon {...props} icon="water" />}
        >
          <Card.Content>
            {/* Box for "What Do Kidneys Do?" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>🔹 What Do Kidneys Do?</Text>
              <Text style={styles.text}>
                Filter waste & maintain balance{"\n"}
                Regulate blood pressure & produce hormones
              </Text>
            </View>

            {/* Box for "Common Kidney Issues" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>⚠️ Common Kidney Issues</Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>{"\n"} CKD:</Text> Gradual kidney function loss{"\n"}{"\n"} 
                <Text style={styles.bold}>Nephrotic Syndrome:</Text> Protein loss in urine{"\n"}{"\n"} 
                <Text style={styles.bold}>AKI:</Text> Sudden kidney damage
              </Text>
            </View>

            {/* Box for "Hydration & Kidney Health" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>💧 Hydration & Kidney Health</Text>
              <Text style={styles.text}>{"\n"} ✅ Drink enough water  avoid sugary drinks.</Text>
            </View>
          </Card.Content>
        </List.Accordion>
      </Card>
      <Divider />

      {/* Serum Creatinine & Its Importance Section */}
      <Card style={styles.sectionCard}>
        <List.Accordion
          title="Importance of Serum Creatinine "
          expanded={expanded.creatinine}
          onPress={() => toggleExpand("creatinine")}
          left={(props) => <List.Icon {...props} icon="flask" />}
        >
          <Card.Content>
            {/* Box for "Normal Creatinine Levels" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>📊 Normal Creatinine Levels</Text>
              <Text style={styles.text}>
              {"\n"} 👶 Infants: <Text style={styles.bold}>0.2 - 0.5 mg/dL</Text>{"\n"}{"\n"} 
                🧒 Children: <Text style={styles.bold}>0.3 - 0.7 mg/dL</Text>{"\n"}{"\n"} 
                🧑 Teens: <Text style={styles.bold}>0.5 - 1.0 mg/dL</Text>
              </Text>
            </View>

            {/* Box for "Factors Affecting Creatinine" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>🔍 Factors Affecting Creatinine</Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>{"\n"} Diet:</Text> High protein intake{"\n"}{"\n"} 
                <Text style={styles.bold}>Dehydration:</Text> Less water intake{"\n"}{"\n"} 
                <Text style={styles.bold}>Medications:</Text> Some impact kidney function
              </Text>
            </View>

            {/* Box for "Ways to Maintain Healthy Levels" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>✅ Ways to Maintain Healthy Levels</Text>
              <Text style={styles.text}>
              {"\n"} 💧 Stay Hydrated{"\n"} {"\n"} 
                🥦 Eat Kidney-Friendly Foods{"\n"} {"\n"} 
                ⚖️ Balance Diet
              </Text>
            </View>
          </Card.Content>
        </List.Accordion>
      </Card>
      <Divider />

      {/* Tracking Creatinine for Better Kidney Health Section */}
      <Card style={styles.sectionCard}>
        <List.Accordion
          title="Tracking Creatinine"
          expanded={expanded.tracking}
          onPress={() => toggleExpand("tracking")}
          left={(props) => <List.Icon {...props} icon="chart-line" />}
        >
          <Card.Content>
            {/* Box for "Why Track Creatinine?" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>📝 Why Track Creatinine?</Text>
              <Text style={styles.text}>{"\n"} 
                ✅ Detect kidney issues early{"\n"}{"\n"} 
                ✅ Monitor CKD progression{"\n"}{"\n"} 
                ✅ Make informed lifestyle choices
              </Text>
            </View>

            {/* Box for "How to Track Creatinine Trends?" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>📅 How to Track Creatinine Trends?</Text>
              <Text style={styles.text}>{"\n"} 
                📌 Save test reports{"\n"}{"\n"} 
                📌 Compare trends over time{"\n"}{"\n"} 
                📌 Follow doctor’s advice
              </Text>
            </View>

            {/* Box for "When to See a Doctor?" */}
            <View style={styles.contentBox}>
              <Text style={styles.heading}>⚠️ When to See a Doctor?</Text>
              <Text style={styles.text}>{"\n"} 
                🚩 Sudden creatinine spike{"\n"}{"\n"} 
                🚩 Swelling, fatigue{"\n"}{"\n"} 
                🚩 Urination changes
              </Text>
            </View>
          </Card.Content>
        </List.Accordion>
      </Card>
      <Divider />
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:50,
    backgroundColor: "#F5F7FA",
    padding: 10,
    
  },
  container2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft:50,
    marginRight:50,
    marginTop:20,
  },
  titleCard: {
    marginBottom: 10,
    backgroundColor: "#daebf7",
    elevation: 2, // Adds a subtle shadow
    marginTop:10,
    
  },
  sectionCard: {
    marginBottom: 10,
    marginTop: 15,
    backgroundColor: "#daebf7",
    elevation: 2, // Adds a subtle shadow
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    
  },
  contentBox: {
    backgroundColor: "#F9F9F9", // Light gray background for content boxes
    borderRadius: 8, // Rounded corners
    padding: 12, // Padding inside the box
    marginVertical: 8, // Space between boxes
    borderWidth: 1, // Border for the box
    borderColor: "#E0E0E0", // Light border color
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: "#555",
    lineHeight: 20, // Better line spacing
  },
  bold: {
    fontWeight: "bold",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default EduContent;