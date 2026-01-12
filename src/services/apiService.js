import axios from "axios";
import API from "../config/api";

const apiService = {
  // Generate code and store text/JSON data
  async generateCode(data) {
    try {
      const response = await axios.post(API.generateCode, { data });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to generate code");
    }
  },

  // Upload multiple files and generate code
  async uploadFiles(files) {
    try {
      const formData = new FormData();

      // Append all files - React Native FormData format
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          type: file.mimeType || "application/octet-stream",
          name: file.name || "file",
        });
      });

      console.log("Uploading files to:", API.uploadFile);
      console.log("Number of files:", files.length);
      files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.mimeType,
          uri: file.uri,
        });
      });

      const response = await axios.post(API.uploadFile, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes timeout for large files
      });
      return response.data;
    } catch (error) {
      console.error("Upload error details:", {
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw new Error(
        error.response?.data?.error || error.message || "Failed to upload files"
      );
    }
  },

  // Verify code and get data info
  async verifyCode(code) {
    try {
      const response = await axios.post(API.verifyCode, { code });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to verify code");
    }
  },

  // Get data by code
  async getData(code) {
    try {
      const response = await axios.get(API.getData(code));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch data");
    }
  },

  // Delete data by code
  async deleteData(code) {
    try {
      const response = await axios.delete(API.deleteData(code));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to delete data");
    }
  },
};

export default apiService;
