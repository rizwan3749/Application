import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import MainNavigator from "./src/navigation/MainNavigator";
import SplashScreen from "./src/screens/SplashScreen";

function AppContent() {
  const { isDarkMode } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000000"
          translucent={false}
        />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "light-content"}
        backgroundColor={isDarkMode ? "#1a1a1a" : "#6200ee"}
        translucent={false}
      />
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: isDarkMode,
            colors: {
              primary: "#6200ee",
              background: isDarkMode ? "#121212" : "#f8f9fa",
              card: isDarkMode ? "#1a1a1a" : "#6200ee",
              text: "#fff",
              border: isDarkMode ? "#333" : "#6200ee",
              notification: "#6200ee",
            },
          }}
        >
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
