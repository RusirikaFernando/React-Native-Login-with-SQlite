import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Switch, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const EGFRScreen = () => {
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [creatinine, setCreatinine] = useState('');
    const [isPediatric, setIsPediatric] = useState(false);
    const [height, setHeight] = useState('');

    const calculateEGFR = () => {
        const ageValue = parseFloat(age);
        const creatinineValue = parseFloat(creatinine);
        const heightValue = parseFloat(height);
        let eGFR = 0;

        // Input validation
        if (isNaN(creatinineValue)) {
            Alert.alert("Error", "Creatinine must be a number");
            return;
        }

        if (creatinineValue <= 0) {
            Alert.alert("Error", "Creatinine must be greater than 0");
            return;
        }

        if (isPediatric) {
            if (isNaN(heightValue) || heightValue <= 0) {
                Alert.alert("Error", "For children, enter valid height (cm)");
                return;
            }
            // Schwartz formula for children
            eGFR = (0.413 * heightValue) / creatinineValue;
        } else {
            if (isNaN(ageValue) || ageValue <= 0) {
                Alert.alert("Error", "Enter valid age (1-120 years)");
                return;
            }
            // CKD-EPI formula for adults
            if (gender === 'female') {
                eGFR = creatinineValue <= 0.7 
                    ? 144 * Math.pow((creatinineValue / 0.7), -0.329) * Math.pow(0.993, ageValue)
                    : 144 * Math.pow((creatinineValue / 0.7), -1.209) * Math.pow(0.993, ageValue);
            } else {
                eGFR = creatinineValue <= 0.9 
                    ? 141 * Math.pow((creatinineValue / 0.9), -0.411) * Math.pow(0.993, ageValue)
                    : 141 * Math.pow((creatinineValue / 0.9), -1.209) * Math.pow(0.993, ageValue);
            }
        }

        showResult(eGFR);
    };

    const showResult = (eGFR) => {
        const { stage, description, action, color } = getStageInfo(eGFR);
        
        Alert.alert(
            `Kidney Health: ${stage}`,
            `🔬 eGFR: ${eGFR.toFixed(2)} mL/min/1.73 m²\n\n` +
            `📋 Status: ${description}\n\n` +
            `❗ Action: ${action}`,
            [
                { text: "OK" },
                { 
                    text: "Learn More", 
                    onPress: () => Linking.openURL("https://www.kidney.org/atoz/content/gfr") 
                }
            ]
        );
    };

    const getStageInfo = (eGFR) => {
        if (eGFR >= 90) {
            return {
                stage: "Stage 1",
                description: "Normal kidney function",
                action: "Maintain healthy habits. Monitor if you have diabetes/high blood pressure.",
                color: "#27ae60" // Green
            };
        } 
        else if (eGFR >= 60) {
            return {
                stage: "Stage 2",
                description: "Mild kidney damage",
                action: "Get annual checkups. Avoid NSAIDs (ibuprofen). Control blood pressure.",
                color: "#f39c12" // Orange
            };
        } 
        else if (eGFR >= 30) {
            return {
                stage: "Stage 3",
                description: "Moderate kidney damage",
                action: "See a nephrologist. Monitor labs every 3-6 months. Limit protein intake.",
                color: "#e67e22" // Dark orange
            };
        } 
        else if (eGFR >= 15) {
            return {
                stage: "Stage 4",
                description: "Severe kidney damage",
                action: "Prepare for dialysis/transplant. Emergency care if swelling/fatigue worsens.",
                color: "#e74c3c" // Red
            };
        } 
        else {
            return {
                stage: "Stage 5",
                description: "Kidney failure",
                action: "Dialysis or transplant needed immediately. Go to hospital if symptoms worsen.",
                color: "#c0392b" // Dark red
            };
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Kidney Function Calculator (eGFR)</Text>
           
            <View style={styles.toggleRow}>
                <Text style={styles.label}>Child Mode:</Text>
                <Switch
                    value={isPediatric}
                    onValueChange={setIsPediatric}
                    trackColor={{ false: "#767577", true: "#3498db" }}
                />
            </View>

            {!isPediatric && (
                <>
                    <Text style={styles.label}>Gender:</Text>
                    <Picker
                        selectedValue={gender}
                        onValueChange={setGender}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                    >
                        <Picker.Item label="Male" value="male" />
                        <Picker.Item label="Female" value="female" />
                    </Picker>

                    <Text style={styles.label}>Age (years):</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={age}
                        onChangeText={setAge}
                        style={styles.input}
                        placeholder="e.g., 45"
                        placeholderTextColor="#95a5a6"
                    />
                </>
            )}

            {isPediatric && (
                <>
                    <Text style={styles.label}>Height (cm):</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                        style={styles.input}
                        placeholder="e.g., 110"
                        placeholderTextColor="#95a5a6"
                    />
                </>
            )}

            <Text style={styles.label}>Creatinine (mg/dL):</Text>
            <TextInput
                keyboardType="numeric"
                value={creatinine}
                onChangeText={setCreatinine}
                style={styles.input}
                placeholder="e.g., 0.8"
                placeholderTextColor="#95a5a6"
            />

            <View style={styles.buttonContainer}>
                <Button
                    title="Calculate Kidney Function"
                    onPress={calculateEGFR}
                    color="#3498db"
                />
            </View>

            <Text style={styles.note}>
                Note: This tool provides estimates. Consult a doctor for medical advice.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        
        backgroundColor: '#ecf0f1',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        height: 40,
        borderColor: '#bdc3c7',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        color: '#2c3e50',
    },
    picker: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    buttonContainer: {
        marginTop: 20,
        borderRadius: 5,
        overflow: 'hidden',
    },
    note: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    },
   
});

export default EGFRScreen;