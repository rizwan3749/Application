import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";
import { useTheme } from "../context/ThemeContext";
import TabNavigator from "./TabNavigator";
import ViewDataScreen from "../screens/ViewDataScreen";
import ReceiverDashboardScreen from "../screens/ReceiverDashboardScreen";
import ShareCodeScreen from "../screens/ShareCodeScreen";

const Stack = createStackNavigator();

export default function MainNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "light-content"}
        backgroundColor={isDarkMode ? "#1a1a1a" : "#6200ee"}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? "#1a1a1a" : "#6200ee",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {/* Tab Navigator as root - will show bottom navbar */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* Modal screens */}
        <Stack.Screen
          name="ShareCode"
          component={ShareCodeScreen}
          options={{
            title: "Share Code",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="ReceiverDashboard"
          component={ReceiverDashboardScreen}
          options={{
            title: "Receiver Dashboard",
          }}
        />
        <Stack.Screen
          name="ViewData"
          component={ViewDataScreen}
          options={{
            title: "Your Data",
          }}
        />
      </Stack.Navigator>
    </>
  );
}
