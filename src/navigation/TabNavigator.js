import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, StatusBar } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import HomeScreen from "../screens/HomeScreen";
import StoreDataScreen from "../screens/StoreDataScreen";
import VerifyCodeScreen from "../screens/VerifyCodeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

// Icon component with circle background for active tab
const TabIcon = ({ name, focused, color, size = 26 }) => {
  const iconProps = {
    size: focused ? size + 2 : size,
    color: focused ? "#fff" : color,
  };

  const getIcon = () => {
    switch (name) {
      case "Home":
        return <MaterialIcons name="home" {...iconProps} />;
      case "Sender":
        return <MaterialIcons name="send" {...iconProps} />;
      case "Receiver":
        return <MaterialIcons name="arrow-downward" {...iconProps} />;
      case "History":
        return <MaterialIcons name="history" {...iconProps} />;
      case "Settings":
        return <MaterialIcons name="settings" {...iconProps} />;
      default:
        return <MaterialIcons name="circle" {...iconProps} />;
    }
  };

  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <View style={styles.circleBackground}>{getIcon()}</View>
      </View>
    );
  }

  return <View style={styles.inactiveIconContainer}>{getIcon()}</View>;
};

const styles = StyleSheet.create({
  activeIconContainer: {
    marginTop: -25,
    alignItems: "center",
    justifyContent: "center",
  },
  circleBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6200ee",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  inactiveIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function TabNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "light-content"}
        backgroundColor={isDarkMode ? "#1a1a1a" : "#6200ee"}
      />
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarActiveTintColor: "#6200ee",
          tabBarInactiveTintColor: "#9e9e9e",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 5,
          },
          tabBarStyle: {
            height: 85,
            paddingBottom: 15,
            paddingTop: 15,
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            borderTopWidth: 0,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            elevation: 25,
            shadowColor: "#6200ee",
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
          },
          tabBarHideOnKeyboard: false,
          tabBarItemStyle: {
            paddingVertical: 5,
            borderRadius: 12,
            marginHorizontal: 4,
          },
          headerStyle: {
            backgroundColor: isDarkMode ? "#1a1a1a" : "#6200ee",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
            letterSpacing: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Sender"
          component={StoreDataScreen}
          options={{
            title: "Send Data",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name="Sender"
                focused={focused}
                color={color}
                size={size}
              />
            ),
            tabBarLabel: "Send",
          }}
        />
        <Tab.Screen
          name="Receiver"
          component={VerifyCodeScreen}
          options={{
            title: "Receive Data",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name="Receiver"
                focused={focused}
                color={color}
                size={size}
              />
            ),
            tabBarLabel: "Receive",
          }}
        />
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name="Home"
                focused={focused}
                color={color}
                size={size}
              />
            ),
            tabBarLabel: "Home",
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: "History",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name="History"
                focused={focused}
                color={color}
                size={size}
              />
            ),
            tabBarLabel: "History",
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name="Settings"
                focused={focused}
                color={color}
                size={size}
              />
            ),
            tabBarLabel: "Settings",
          }}
        />
      </Tab.Navigator>
    </>
  );
}
