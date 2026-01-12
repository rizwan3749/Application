import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onFinish }) {
  const { colors, isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
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

    // Wait 2-3 seconds then call onFinish
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* GIF Logo - Use d.gif in dark mode, share.gif in light mode */}
        <Image
          source={
            isDarkMode
              ? require("../../assets/d.gif")
              : require("../../assets/share.gif")
          }
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Logo Text */}
        <Animated.View
          style={[
            styles.logoTextContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.logoText}>MongoDB Data Manager</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoBox: {
    width: width * 0.6,
    height: width * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: width * 0.5,
    height: width * 0.5,
    maxWidth: 250,
    maxHeight: 250,
    borderRadius: 10,
    borderStyle: "solid",
    borderColor: "white",
    borderWidth: 1,
  },
  logoTextContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
