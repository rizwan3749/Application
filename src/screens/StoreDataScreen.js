import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";

export default function StoreDataScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const dynamicStyles = getDynamicStyles(colors, isDarkMode);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleStoreData = async () => {
    if (!data.trim() && selectedFiles.length === 0) {
      Alert.alert("Error", "Please enter data or select file(s)");
      return;
    }

    if (selectedFiles.length > 0) {
      // Upload multiple files
      setUploading(true);
      try {
        const response = await apiService.uploadFiles(selectedFiles);

        // Navigate to ShareCodeScreen
        navigation.navigate("ShareCode", {
          code: response.code,
          itemCount: response.itemCount || selectedFiles.length,
          fileName: selectedFiles.length === 1 ? selectedFiles[0].name : null,
          fileType:
            selectedFiles.length === 1 ? selectedFiles[0].mimeType : null,
          createdAt: new Date().toISOString(),
        });

        // Clear form
        setData("");
        setSelectedFiles([]);
        setGeneratedCode(null);
      } catch (error) {
        let errorMessage = error.message;
        if (
          errorMessage.includes("413") ||
          errorMessage.includes("5GB") ||
          errorMessage.includes("File size exceeds")
        ) {
          errorMessage =
            "File size exceeds 5GB limit. Please upload smaller files.";
        }
        Alert.alert("Error", errorMessage);
      } finally {
        setUploading(false);
      }
    } else {
      // Store text/JSON data
      setLoading(true);
      try {
        let parsedData;
        try {
          // Try to parse as JSON
          parsedData = JSON.parse(data);
        } catch {
          // If not valid JSON, store as plain text
          parsedData = { text: data };
        }

        const response = await apiService.generateCode(parsedData);

        // Navigate to ShareCodeScreen
        navigation.navigate("ShareCode", {
          code: response.code,
          itemCount: 1,
          fileName: null,
          fileType: null,
          createdAt: new Date().toISOString(),
        });

        // Clear form
        setData("");
        setGeneratedCode(null);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Accept all file types
        copyToCacheDirectory: true,
        multiple: true, // Allow multiple file selection
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets.map((file) => ({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || "application/octet-stream",
          size: file.size,
        }));
        setSelectedFiles([...selectedFiles, ...files]);
        setData(""); // Clear text input when files are selected
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick files");
    }
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={[styles.iconWrapper, dynamicStyles.iconWrapper]}>
              <MaterialIcons name="cloud-upload" size={32} color="#6200ee" />
            </View>
            <Text style={[styles.mainTitle, dynamicStyles.mainTitle]}>
              Send Data
            </Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Upload files or enter text/JSON data
            </Text>
          </View>

          {/* File Upload Card */}
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="attach-file"
                size={24}
                color={isDarkMode ? "#fff" : "#6200ee"}
              />
              <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>
                Upload Files
              </Text>
            </View>
            <Text
              style={[styles.cardDescription, dynamicStyles.cardDescription]}
            >
              Select multiple files (PDF, ZIP, CSV, images, etc.){"\n"}
              Maximum size: 5GB per file
            </Text>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                (loading || uploading || generatedCode) &&
                  styles.buttonDisabled,
              ]}
              onPress={handlePickFiles}
              disabled={loading || uploading || generatedCode}
            >
              <MaterialIcons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {selectedFiles.length > 0
                  ? `Add More Files (${selectedFiles.length} selected)`
                  : "Select Files"}
              </Text>
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <View style={styles.filesList}>
                {selectedFiles.map((file, index) => (
                  <View
                    key={index}
                    style={[styles.fileCard, dynamicStyles.fileCard]}
                  >
                    <View style={styles.fileIconWrapper}>
                      <MaterialIcons
                        name="insert-drive-file"
                        size={24}
                        color="#6200ee"
                      />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text
                        style={[styles.fileName, dynamicStyles.fileName]}
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                      <View style={styles.fileMetaRow}>
                        <Text style={[styles.fileSize, dynamicStyles.fileSize]}>
                          {formatFileSize(file.size)}
                        </Text>
                        <View
                          style={[
                            styles.fileTypeBadge,
                            dynamicStyles.fileTypeBadge,
                          ]}
                        >
                          <Text
                            style={[styles.fileType, dynamicStyles.fileType]}
                          >
                            {file.mimeType.split("/")[1]?.toUpperCase() ||
                              "FILE"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFile(index)}
                    >
                      <MaterialIcons name="close" size={20} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, dynamicStyles.dividerLine]} />
            <Text style={[styles.dividerText, dynamicStyles.dividerText]}>
              OR
            </Text>
            <View style={[styles.dividerLine, dynamicStyles.dividerLine]} />
          </View>

          {/* Text Input Card */}
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="edit"
                size={24}
                color={isDarkMode ? "#fff" : "#6200ee"}
              />
              <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>
                Enter Text/JSON Data
              </Text>
            </View>
            <TextInput
              style={[styles.textInput, dynamicStyles.textInput]}
              multiline
              numberOfLines={8}
              placeholder="Type your text or JSON data here..."
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              value={data}
              onChangeText={(text) => {
                setData(text);
                if (text) setSelectedFiles([]);
              }}
              textAlignVertical="top"
              editable={
                !loading &&
                !uploading &&
                !generatedCode &&
                selectedFiles.length === 0
              }
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                (loading || uploading || generatedCode) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleStoreData}
              disabled={loading || uploading || generatedCode}
            >
              {loading || uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="send" size={22} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {selectedFiles.length > 0
                      ? `Upload ${selectedFiles.length} File(s)`
                      : "Generate Code & Store"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionButton,
                dynamicStyles.secondaryActionButton,
              ]}
              onPress={() => {
                setData("");
                setSelectedFiles([]);
                setGeneratedCode(null);
              }}
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={isDarkMode ? "#fff" : "#6200ee"}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  dynamicStyles.secondaryButtonText,
                ]}
              >
                Clear All
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
    iconWrapper: {
      backgroundColor: colors.surface,
    },
    mainTitle: {
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    cardTitle: {
      color: colors.text,
    },
    cardDescription: {
      color: colors.textSecondary,
    },
    fileCard: {
      backgroundColor: isDarkMode ? "#2a2a2a" : "#f8f9fa",
      borderColor: colors.border,
    },
    fileName: {
      color: colors.text,
    },
    fileSize: {
      color: colors.textSecondary,
    },
    fileTypeBadge: {
      backgroundColor: isDarkMode ? "#3a3a3a" : "#e0e0e0",
    },
    fileType: {
      color: colors.textSecondary,
    },
    dividerLine: {
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSecondary,
    },
    textInput: {
      backgroundColor: isDarkMode ? "#2a2a2a" : "#f8f9fa",
      borderColor: colors.border,
      color: colors.text,
    },
    secondaryActionButton: {
      borderColor: colors.primary,
    },
    secondaryButtonText: {
      color: colors.primary,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  // Header Section
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  // Card Styles
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  // Upload Button
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Files List
  filesList: {
    marginTop: 15,
    gap: 10,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  fileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  fileMetaRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  fileSize: {
    fontSize: 12,
    fontWeight: "500",
  },
  fileTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  fileType: {
    fontSize: 11,
    fontWeight: "600",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffebee",
  },
  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: "600",
  },
  // Text Input
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    minHeight: 180,
    textAlignVertical: "top",
    marginTop: 10,
  },
  // Action Buttons
  actionButtons: {
    gap: 12,
    marginTop: 10,
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6200ee",
    padding: 18,
    borderRadius: 12,
    gap: 10,
    elevation: 4,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
});
