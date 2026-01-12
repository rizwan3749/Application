import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from storage
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("darkMode");
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem("darkMode", JSON.stringify(newTheme));
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      background: isDarkMode ? "#121212" : "#f8f9fa",
      surface: isDarkMode ? "#1e1e1e" : "#ffffff",
      text: isDarkMode ? "#ffffff" : "#1a1a1a",
      textSecondary: isDarkMode ? "#b0b0b0" : "#666",
      primary: "#6200ee",
      secondary: isDarkMode ? "#03dac6" : "#03dac6",
      border: isDarkMode ? "#333333" : "#e0e0e0",
      card: isDarkMode ? "#2a2a2a" : "#ffffff",
      shadow: isDarkMode ? "#000000" : "#000000",
    },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};








