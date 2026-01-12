import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const dynamicStyles = getDynamicStyles(colors, isDarkMode);
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const button1Anim = useRef(new Animated.Value(0)).current;
  const button2Anim = useRef(new Animated.Value(0)).current;
  const button3Anim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title and subtitle animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Button animations with delay
    Animated.stagger(150, [
      Animated.timing(button1Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(button2Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(button3Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleIconPress = () => {
    // Reset and rotate on press
    iconRotate.setValue(0);
    Animated.timing(iconRotate, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Reset after animation completes
      iconRotate.setValue(0);
    });
  };

  const handlePressIn = (animValue) => {
    Animated.spring(animValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (animValue) => {
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const button3Scale = useRef(new Animated.Value(1)).current;

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Animated Header */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity onPress={handleIconPress} activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  dynamicStyles.iconContainer,
                  { transform: [{ rotate: iconRotation }] },
                ]}
              >
                <Image
                  source={isDarkMode ? require("../../assets/d.gif") : require("../../assets/share.gif")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </TouchableOpacity>
            <Text style={[styles.title, dynamicStyles.title]}>Share Data Manager</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Store, verify, and download your data securely
            </Text>
          </Animated.View>

          {/* Animated Buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View
              style={{
                opacity: button1Anim,
                alignItems: "center",
                transform: [
                  {
                    translateY: button1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              <Animated.View style={{ transform: [{ scale: button1Scale }] }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    styles.centeredButton,
                  ]}
                  onPress={() => {
                    navigation
                      .getParent()
                      ?.navigate("MainTabs", { screen: "Sender" });
                  }}
                  onPressIn={() => handlePressIn(button1Scale)}
                  onPressOut={() => handlePressOut(button1Scale)}
                  activeOpacity={0.9}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="cloud-upload" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Sender Data</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            <Animated.View
              style={{
                opacity: button2Anim,
                transform: [
                  {
                    translateY: button2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              <Animated.View style={{ transform: [{ scale: button2Scale }] }}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => {
                    navigation
                      .getParent()
                      ?.navigate("MainTabs", { screen: "Receiver" });
                  }}
                  onPressIn={() => handlePressIn(button2Scale)}
                  onPressOut={() => handlePressOut(button2Scale)}
                  activeOpacity={0.9}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons
                      name="arrow-downward"
                      size={24}
                      color="#fff"
                    />
                    <Text style={styles.buttonText}>Receiver Data</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Animated Info Card */}
          <Animated.View
            style={[
              styles.infoContainer,
              dynamicStyles.infoContainer,
              {
                opacity: button3Anim,
                transform: [
                  {
                    translateY: button3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={24} color="#6200ee" />
              <Text style={[styles.infoTitle, dynamicStyles.infoTitle]}>How it works:</Text>
            </View>
            <View style={styles.stepsContainer}>
              {[
                "Store your data and get a unique code",
                "Share the code with others",
                "Verify the code to access the data",
                "Download your data securely",
              ].map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, dynamicStyles.stepText]}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
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
    subtitle: {
      color: colors.textSecondary,
    },
    infoContainer: {
      backgroundColor: colors.surface,
    },
    infoTitle: {
      color: colors.text,
    },
    stepText: {
      color: colors.textSecondary,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 25,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 20,
    
    
    
   
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 18,
    marginBottom: 30,
    alignItems: "center",
  },
  centeredButton: {
    width: "90%",
    maxWidth: 400,
  },
  button: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6200ee",
  },
  secondaryButton: {
    backgroundColor: "#03dac6",
  },
  historyButton: {
    backgroundColor: "#ff9800",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginTop: 20,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6200ee",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
