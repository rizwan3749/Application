import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function HistoryScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const dynamicStyles = getDynamicStyles(colors, isDarkMode);
  const [savedCodes, setSavedCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const savedCodesData = await AsyncStorage.getItem("savedCodes");
      if (savedCodesData) {
        const codes = JSON.parse(savedCodesData);
        setSavedCodes(codes);
      } else {
        setSavedCodes([]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (codeToDelete) => {
    Alert.alert(
      "Delete Code",
      "Are you sure you want to remove this code from history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedCodes = savedCodes.filter(
                (c) => c.code !== codeToDelete
              );
              await AsyncStorage.setItem(
                "savedCodes",
                JSON.stringify(updatedCodes)
              );
              setSavedCodes(updatedCodes);
              Alert.alert("Success", "Code removed from history");
            } catch (error) {
              Alert.alert("Error", "Failed to delete code");
            }
          },
        },
      ]
    );
  };

  const clearAllHistory = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all saved codes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("savedCodes");
              setSavedCodes([]);
              Alert.alert("Success", "All history cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCodeItem = ({ item }) => (
    <View style={[styles.codeCard, dynamicStyles.codeCard]}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeText}>{item.code}</Text>
        <TouchableOpacity
          style={[styles.deleteButton, dynamicStyles.deleteButton]}
          onPress={() => deleteCode(item.code)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.codeInfo}>
        <Text style={[styles.infoText, dynamicStyles.infoText]}>
          📦 {item.itemCount || 1} {item.itemCount > 1 ? "items" : "item"}
        </Text>
        {item.fileName && (
          <Text
            style={[styles.infoText, dynamicStyles.infoText]}
            numberOfLines={1}
          >
            📄 {item.fileName}
          </Text>
        )}
        <Text style={[styles.dateText, dynamicStyles.dateText]}>
          📅 Created: {formatDate(item.createdAt)}
        </Text>
        <Text style={[styles.dateText, dynamicStyles.dateText]}>
          💾 Saved: {formatDate(item.savedAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => {
          // Navigate to Receiver tab and pass the code
          navigation.getParent()?.navigate("MainTabs", {
            screen: "Receiver",
            params: { prefillCode: item.code },
          });
        }}
      >
        <Text style={styles.verifyButtonText}>Verify This Code</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
            Loading history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
          History
        </Text>
        {savedCodes.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllHistory}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {savedCodes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            No saved codes yet
          </Text>
          <Text style={[styles.emptySubtext, dynamicStyles.emptySubtext]}>
            Codes you save will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedCodes}
          renderItem={renderCodeItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
        />
      )}
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
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
    },
    loadingText: {
      color: colors.textSecondary,
    },
    emptyText: {
      color: colors.text,
    },
    emptySubtext: {
      color: colors.textSecondary,
    },
    codeCard: {
      backgroundColor: colors.surface,
    },
    deleteButton: {
      backgroundColor: isDarkMode ? "#3a1f1f" : "#ffebee",
    },
    infoText: {
      color: colors.text,
    },
    dateText: {
      color: colors.textSecondary,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#d32f2f",
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  codeCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  codeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ee",
    letterSpacing: 2,
    flex: 1,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#d32f2f",
    fontSize: 18,
    fontWeight: "bold",
  },
  codeInfo: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    marginBottom: 3,
  },
  verifyButton: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
