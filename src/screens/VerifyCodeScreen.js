import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";

export default function VerifyCodeScreen({ navigation, route }) {
  const { colors, isDarkMode } = useTheme();
  const prefillCode = route?.params?.prefillCode || "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const verifyingRef = useRef(false);

  const handleVerify = useCallback(
    async (codeToVerify) => {
      const code = codeToVerify;

      if (code.length !== 6) {
        Alert.alert("Error", "Please enter a 6-digit code");
        return;
      }

      if (verifyingRef.current) return; // Prevent duplicate calls
      verifyingRef.current = true;
      setLoading(true);

      try {
        const response = await apiService.verifyCode(code);

        // Navigate to Receiver Dashboard with all items
        navigation.navigate("ReceiverDashboard", {
          code: response.code || code,
          items: response.items || [],
          createdAt: response.createdAt,
        });
      } catch (error) {
        Alert.alert("Error", error.message);
        // Clear all digits on error
        setDigits(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } finally {
        setLoading(false);
        verifyingRef.current = false;
      }
    },
    [navigation]
  );

  // Update digits when prefillCode changes
  useEffect(() => {
    if (prefillCode && prefillCode.length === 6) {
      const codeDigits = prefillCode.split("").slice(0, 6);
      setDigits(codeDigits);
    }
  }, [prefillCode]);

  // Auto-verify when all 6 digits are filled
  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && !loading && !verifyingRef.current) {
      handleVerify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits.join("")]);

  const handleChangeText = (text, index) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length > 1) {
      // Handle paste: fill multiple boxes
      const pasteDigits = numericText.split("").slice(0, 6);
      const newDigits = [...digits];
      pasteDigits.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit;
        }
      });
      setDigits(newDigits);

      // Focus the last filled box or the last box
      const nextIndex = Math.min(index + pasteDigits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else if (numericText.length === 1) {
      // Single digit input
      const newDigits = [...digits];
      newDigits[index] = numericText;
      setDigits(newDigits);

      // Move to next box if not the last one
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      // Empty input (backspace)
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      // If current box is empty and backspace is pressed, go to previous box
      inputRefs.current[index - 1].focus();
    }
  };

  const dynamicStyles = getDynamicStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <View style={styles.content}>
        {/* Padlock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <View style={styles.lockContainer}>
              {/* Lock Shackle */}
              <View style={styles.lockShackle}>
                <View style={styles.shackleTop} />
              </View>
              {/* Lock Body */}
              <View style={styles.lockBody} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, dynamicStyles.title]}>
          Verification Code
        </Text>

        {/* Instructions */}
        <Text style={[styles.instructionText, dynamicStyles.instructionText]}>
          Please enter the code sent to access your data
        </Text>

        {/* Code Input Boxes */}
        <View style={styles.codeContainer}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeBox,
                dynamicStyles.codeBox,
                digit && [styles.codeBoxFilled, dynamicStyles.codeBoxFilled],
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
              textAlign="center"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (loading || digits.join("").length !== 6) &&
              styles.verifyButtonDisabled,
          ]}
          onPress={() => handleVerify(digits.join(""))}
          disabled={loading || digits.join("").length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>VERIFY</Text>
          )}
        </TouchableOpacity>
      </View>
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
    instructionText: {
      color: colors.textSecondary,
    },
    codeBox: {
      borderColor: isDarkMode ? "#FFFFFF" : "#CCCCCC",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
      color: colors.text,
    },
    codeBoxFilled: {
      borderColor: isDarkMode ? "#FFFFFF" : "#CCCCCC",
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 30,
    paddingTop: 60,
    paddingBottom: 100,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lockContainer: {
    width: 30,
    height: 35,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  lockShackle: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  shackleTop: {
    width: 24,
    height: 18,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "transparent",
  },
  lockBody: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 22,
    borderRadius: 2,
    borderWidth: 3,
    borderColor: "#ffffff",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 50,
    width: "100%",
  },
  codeBox: {
    width: 55,
    height: 65,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 32,
    fontWeight: "bold",
    marginHorizontal: 6,
    textAlign: "center",
  },
  codeBoxFilled: {
    borderWidth: 2,
  },
  verifyButton: {
    width: "100%",
    backgroundColor: "#6200ee",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minHeight: 56,
  },
  verifyButtonDisabled: {
    backgroundColor: "#9c7ddb",
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
