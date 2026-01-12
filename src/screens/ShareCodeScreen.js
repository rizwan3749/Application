import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ShareCodeScreen({ route, navigation }) {
  const { code, itemCount, fileName, fileType, createdAt } = route.params;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check if code is already saved
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {
      const savedCodes = await AsyncStorage.getItem("savedCodes");
      if (savedCodes) {
        const codes = JSON.parse(savedCodes);
        const exists = codes.some((c) => c.code === code);
        setSaved(exists);
      }
    } catch (error) {
      console.error("Error checking saved codes:", error);
    }
  };

  const saveToHistory = async () => {
    try {
      const savedCodes = await AsyncStorage.getItem("savedCodes");
      let codes = savedCodes ? JSON.parse(savedCodes) : [];

      // Check if code already exists
      const exists = codes.some((c) => c.code === code);
      if (!exists) {
        codes.unshift({
          code,
          itemCount,
          fileName,
          fileType,
          createdAt: createdAt || new Date().toISOString(),
          savedAt: new Date().toISOString(),
        });

        // Keep only last 100 codes
        if (codes.length > 100) {
          codes = codes.slice(0, 100);
        }

        await AsyncStorage.setItem("savedCodes", JSON.stringify(codes));
        setSaved(true);
        Alert.alert("Success", "Code saved to history!");
      } else {
        Alert.alert("Info", "Code already saved in history");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save code to history");
    }
  };

  const shareCode = async () => {
    try {
      const shareText = `Share this code to access the data:\n\nCode: ${code}\n\nUse this code in the app to download the files/data.`;
      await Clipboard.setStringAsync(code);
      Alert.alert(
        "Code Copied!",
        "Code has been copied to clipboard. You can now share it."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to copy code");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <Text style={styles.title}>Data Uploaded Successfully!</Text>
          <Text style={styles.subtitle}>
            {itemCount || 1} {itemCount > 1 ? "items" : "item"} uploaded
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Share This Code:</Text>
            <Text style={styles.codeText}>{code}</Text>
            <Text style={styles.codeHint}>
              Share this code with the receiver to access the files/data
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📅 Created: {formatDate(createdAt)}
            </Text>
            {fileName && (
              <Text style={styles.infoText}>📄 File: {fileName}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveToHistory}
          >
            <Text style={styles.buttonText}>
              {saved ? "✓ Saved to History" : "💾 Save to History"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={shareCode}
          >
            <Text style={styles.buttonText}>📤 Share Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dashboardButton]}
            onPress={() => {
              // Navigate back to main tabs
              navigation
                .getParent()
                ?.navigate("MainTabs", { screen: "Sender" });
            }}
          >
            <Text style={styles.buttonText}>🏠 Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 50,
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  codeContainer: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  codeLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    fontWeight: "600",
  },
  codeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6200ee",
    letterSpacing: 3,
    marginBottom: 15,
    textAlign: "center",
  },
  codeHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    color: "#1976d2",
    marginBottom: 5,
  },
  button: {
    width: "100%",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: "#03dac6",
  },
  shareButton: {
    backgroundColor: "#6200ee",
  },
  dashboardButton: {
    backgroundColor: "#ff9800",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
