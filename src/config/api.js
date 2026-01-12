// API Configuration
// Change this to your backend server URL
// For Android emulator: http://10.0.2.2:3000/api
// For iOS simulator: http://localhost:3000/api
// For physical device: http://YOUR_COMPUTER_IP:3000/api
// Example: http://192.168.1.28:3000/api (replace with your computer's IP)

// Auto-detect API URL based on platform
// For Android emulator: http://10.0.2.2:3000/api
// For physical device: http://192.168.1.34:3000/api (update with your computer's IP)
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  // You can change this to your computer's IP address for physical devices
  // Find your IP: Windows: ipconfig, Mac/Linux: ifconfig
  const DEVICE_IP = "192.168.1.34"; // Update this with your computer's IP

  if (Platform.OS === "android") {
    // Check if running on emulator (10.0.2.2) or physical device
    return __DEV__
      ? `http://${DEVICE_IP}:3000/api`
      : `http://${DEVICE_IP}:3000/api`;
  } else if (Platform.OS === "ios") {
    return __DEV__
      ? `http://localhost:3000/api`
      : `http://${DEVICE_IP}:3000/api`;
  }
  return `http://localhost:3000/api`;
};

const API_BASE_URL = getApiBaseUrl();

export default {
  generateCode: `${API_BASE_URL}/generate-code`,
  uploadFile: `${API_BASE_URL}/upload-file`,
  verifyCode: `${API_BASE_URL}/verify-code`,
  getData: (code) => `${API_BASE_URL}/data/${code}`,
  downloadData: (code, itemId) => `${API_BASE_URL}/download/${code}/${itemId}`,
  deleteData: (code) => `${API_BASE_URL}/data/${code}`,
};
