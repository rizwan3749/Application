import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const clearAllHistory = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all saved codes? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("savedCodes");
              Alert.alert("Success", "All history cleared!");
            } catch (error) {
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  const clearCache = () => {
    Alert.alert("Clear Cache", "This will clear app cache. Continue?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        onPress: () => {
          Alert.alert("Success", "Cache cleared!");
        },
      },
    ]);
  };

  const dynamicStyles = getDynamicStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, dynamicStyles.title]}>Settings</Text>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              App Settings
            </Text>

            <View style={[styles.settingItem, dynamicStyles.settingItem]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Dark Mode
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    dynamicStyles.settingDescription,
                  ]}
                >
                  Switch to dark theme
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: "#6200ee" }}
                thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={[styles.settingItem, dynamicStyles.settingItem]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Notifications
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    dynamicStyles.settingDescription,
                  ]}
                >
                  Enable push notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#6200ee" }}
                thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={[styles.settingItem, dynamicStyles.settingItem]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Auto Save Codes
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    dynamicStyles.settingDescription,
                  ]}
                >
                  Automatically save generated codes to history
                </Text>
              </View>
              <Switch
                value={autoSaveEnabled}
                onValueChange={setAutoSaveEnabled}
                trackColor={{ false: "#767577", true: "#6200ee" }}
                thumbColor={autoSaveEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Data Management
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, dynamicStyles.actionButton]}
              onPress={clearAllHistory}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  dynamicStyles.actionButtonText,
                ]}
              >
                🗑️ Clear All History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, dynamicStyles.actionButton]}
              onPress={clearCache}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  dynamicStyles.actionButtonText,
                ]}
              >
                🧹 Clear Cache
              </Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              About
            </Text>
            <View style={[styles.infoBox, dynamicStyles.infoBox]}>
              <Text style={[styles.infoText, dynamicStyles.infoText]}>
                <Text style={[styles.boldText, dynamicStyles.boldText]}>
                  MongoDB Data Manager
                </Text>
                {"\n"}Version 1.0.0
                {"\n\n"}
                Store, verify, and download your data securely using unique
                codes.
              </Text>
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Support
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, dynamicStyles.actionButton]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  dynamicStyles.actionButtonText,
                ]}
              >
                📧 Contact Support
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, dynamicStyles.actionButton]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  dynamicStyles.actionButtonText,
                ]}
              >
                📖 User Guide
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getDynamicStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
    },
    sectionTitle: {
      color: colors.primary,
    },
    settingItem: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    settingLabel: {
      color: colors.text,
    },
    settingDescription: {
      color: colors.textSecondary,
    },
    actionButton: {
      backgroundColor: colors.surface,
    },
    actionButtonText: {
      color: colors.text,
    },
    infoBox: {
      backgroundColor: isDarkMode ? "#1e3a5f" : "#e3f2fd",
    },
    infoText: {
      color: isDarkMode ? "#90caf9" : "#1976d2",
    },
    boldText: {
      color: colors.text,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
  },
  actionButton: {
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
  },
});
