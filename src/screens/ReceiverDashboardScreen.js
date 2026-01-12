import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import apiService from "../services/apiService";
import API from "../config/api";
import { useTheme } from "../context/ThemeContext";

export default function ReceiverDashboardScreen({ route, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const dynamicStyles = getDynamicStyles(colors, isDarkMode);
  const { code, items: initialItems, createdAt } = route.params;
  const [items, setItems] = useState(initialItems || []);
  const [downloading, setDownloading] = useState({});
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleDownload = async (itemId) => {
    setDownloading({ ...downloading, [itemId]: true });
    try {
      const downloadUrl = API.downloadData(code, itemId);
      const item = items[itemId];
      const fileName = item.isFile
        ? item.fileName || `file-${code}-${itemId}`
        : `data-${code}-${itemId}.json`;

      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        fileUri
      );

      if (downloadResult.status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: item.isFile
              ? item.fileType || "application/octet-stream"
              : "application/json",
            dialogTitle: "Download File",
          });
        }

        // Update item status
        const updatedItems = [...items];
        updatedItems[itemId].downloaded = true;
        setItems(updatedItems);

        Alert.alert(
          "Success",
          `${item.isFile ? "File" : "Data"} downloaded successfully!`
        );
      }
    } catch (error) {
      if (error.message.includes("410")) {
        Alert.alert(
          "Already Downloaded",
          "This item has already been downloaded."
        );
        const updatedItems = [...items];
        updatedItems[itemId].downloaded = true;
        setItems(updatedItems);
      } else {
        Alert.alert("Error", error.message || "Failed to download");
      }
    } finally {
      setDownloading({ ...downloading, [itemId]: false });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Data",
      "Are you sure you want to delete all data associated with this code? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await apiService.deleteData(code);
              Alert.alert("Success", "Data deleted successfully", [
                {
                  text: "OK",
                  onPress: () =>
                    navigation
                      .getParent()
                      ?.navigate("MainTabs", { screen: "Receiver" }),
                },
              ]);
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete data");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = (item, index) => {
    const isDownloading = downloading[index] || false;
    const isDownloaded = item.downloaded || false;

    return (
      <View key={index} style={[styles.itemCard, dynamicStyles.itemCard]}>
        {item.isFile ? (
          <>
            <View style={styles.fileHeader}>
              <Text style={styles.fileIcon}>📄</Text>
              <View style={styles.fileInfo}>
                <Text
                  style={[styles.fileName, dynamicStyles.fileName]}
                  numberOfLines={1}
                >
                  {item.fileName || "Unknown File"}
                </Text>
                <Text style={[styles.fileMeta, dynamicStyles.fileMeta]}>
                  {item.fileType || "application/octet-stream"} •{" "}
                  {formatFileSize(item.fileSize)}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.dataLabel, dynamicStyles.dataLabel]}>
              Data Item #{index + 1}
            </Text>
            <View style={[styles.dataPreview, dynamicStyles.dataPreview]}>
              <Text
                style={[styles.dataText, dynamicStyles.dataText]}
                numberOfLines={3}
              >
                {typeof item.data === "object"
                  ? JSON.stringify(item.data, null, 2)
                  : String(item.data)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.itemActions}>
          {isDownloaded ? (
            <View
              style={[styles.downloadedBadge, dynamicStyles.downloadedBadge]}
            >
              <Text style={styles.downloadedText}>✓ Downloaded</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isDownloading && styles.buttonDisabled,
              ]}
              onPress={() => handleDownload(index)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.downloadButtonText}>Download</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={[styles.header, dynamicStyles.header]}>
            <Text style={[styles.codeLabel, dynamicStyles.codeLabel]}>
              Code:
            </Text>
            <Text style={styles.codeText}>{code}</Text>
            <Text style={[styles.dateText, dynamicStyles.dateText]}>
              Created: {formatDate(createdAt)}
            </Text>
          </View>

          <View style={[styles.summaryCard, dynamicStyles.summaryCard]}>
            <Text style={[styles.summaryText, dynamicStyles.summaryText]}>
              {items.length} {items.length === 1 ? "item" : "items"} available
            </Text>
            <Text style={[styles.summarySubtext, dynamicStyles.summarySubtext]}>
              {items.filter((item) => item.downloaded).length} downloaded
            </Text>
          </View>

          <View style={styles.itemsContainer}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Files & Data:
            </Text>
            {items.map((item, index) => renderItem(item, index))}
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.deleteButtonText}>🗑️ Delete All Data</Text>
                <Text style={styles.deleteButtonSubtext}>
                  Permanently delete this code and all data
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() =>
              navigation
                .getParent()
                ?.navigate("MainTabs", { screen: "Receiver" })
            }
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
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
    header: {
      backgroundColor: colors.surface,
    },
    codeLabel: {
      color: colors.textSecondary,
    },
    dateText: {
      color: colors.textSecondary,
    },
    summaryCard: {
      backgroundColor: isDarkMode ? "#1e3a5f" : "#e3f2fd",
      borderLeftColor: isDarkMode ? "#64b5f6" : "#2196f3",
    },
    summaryText: {
      color: isDarkMode ? "#90caf9" : "#1976d2",
    },
    summarySubtext: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    itemCard: {
      backgroundColor: colors.surface,
    },
    fileName: {
      color: colors.text,
    },
    fileMeta: {
      color: colors.textSecondary,
    },
    dataLabel: {
      color: colors.text,
    },
    dataPreview: {
      backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    },
    dataText: {
      color: colors.textSecondary,
    },
    downloadedBadge: {
      backgroundColor: isDarkMode ? "#1b5e20" : "#e8f5e9",
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
  header: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  codeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6200ee",
    letterSpacing: 2,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
  },
  summaryCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    borderLeftWidth: 4,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summarySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  itemCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  fileMeta: {
    fontSize: 12,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dataPreview: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dataText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  downloadButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  downloadedBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadedText: {
    color: "#2e7d32",
    fontWeight: "bold",
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
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
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteButtonSubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
  button: {
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  secondaryButton: {
    backgroundColor: "#03dac6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
