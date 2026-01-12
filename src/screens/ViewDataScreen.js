import React, { useState } from "react";
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

export default function ViewDataScreen({ route, navigation }) {
  const {
    code,
    isFile,
    fileName,
    fileType,
    fileSize,
    data,
    verified,
    createdAt,
  } = route.params;
  const [downloading, setDownloading] = useState(false);

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

  const getFileExtension = (filename) => {
    if (!filename) return "";
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let fileUri;
      let finalFileName = fileName || `data-${code}`;

      // Use FileSystem.downloadAsync for direct download
      const downloadUrl = API.downloadData(code);
      fileUri = FileSystem.documentDirectory + finalFileName;

      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        fileUri
      );

      if (downloadResult.status === 200) {
        // Share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: isFile
              ? fileType || "application/octet-stream"
              : "application/json",
            dialogTitle: "Download File",
          });
          Alert.alert(
            "Success",
            `${
              isFile ? "File" : "Data"
            } downloaded successfully!\n\n This code has been deleted and cannot be used again.`,
            [
              {
                text: "OK",
                onPress: () =>
                  navigation
                    .getParent()
                    ?.navigate("MainTabs", { screen: "Receiver" }),
              },
            ]
          );
        } else {
          Alert.alert("Success", `File saved to: ${downloadResult.uri}`);
        }
      } else {
        throw new Error("Download failed");
      }
      setDownloading(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to download data");
      setDownloading(false);
    }
  };

  const formatData = (data) => {
    if (!data) return "No preview available";
    if (typeof data === "object") {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.codeLabel}>Code:</Text>
            <Text style={styles.codeText}>{code}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[styles.statusBadge, verified && styles.verifiedBadge]}
            >
              <Text style={styles.statusText}>
                {verified ? "✓ Verified" : "Not Verified"}
              </Text>
            </View>
            <Text style={styles.dateText}>
              Created: {formatDate(createdAt)}
            </Text>
          </View>

          {isFile ? (
            <View style={styles.fileInfoContainer}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.fileName}>{fileName || "Unknown File"}</Text>
              <Text style={styles.fileType}>
                {fileType || "application/octet-stream"}
              </Text>
              {fileSize && (
                <Text style={styles.fileSize}>
                  Size: {formatFileSize(fileSize)}
                </Text>
              )}
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                   This code can only be used once. After download, it will be
                  permanently deleted.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>Your Data:</Text>
              <View style={styles.dataBox}>
                <Text style={styles.dataText}>{formatData(data)}</Text>
              </View>
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                   This code can only be used once. After download, it will be
                  permanently deleted.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, downloading && styles.buttonDisabled]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {isFile
                    ? `Download ${fileName || "File"}`
                    : "Download as JSON"}
                </Text>
                <Text style={styles.buttonSubtext}>One-time download only</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back</Text>
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
  },
  header: {
    backgroundColor: "#fff",
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
    color: "#666",
    marginBottom: 5,
  },
  codeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6200ee",
    letterSpacing: 2,
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedBadge: {
    backgroundColor: "#e8f5e9",
  },
  statusText: {
    color: "#c62828",
    fontWeight: "bold",
    fontSize: 14,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  fileInfoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  fileIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  fileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  fileType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  dataContainer: {
    marginBottom: 15,
  },
  dataLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  dataBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 150,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginBottom: 15,
  },
  dataText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  warningBox: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
    marginBottom: 20,
  },
  warningText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#6200ee",
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
  buttonSubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
});
