import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // ✅ Ensure this is correct

// ✅ Register User
const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw error;
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from server. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up request: " + error.message);
    }
  }
};

// ✅ Login User
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      throw error;
    } else if (error.request) {
      throw new Error("No response received from server. Please check your connection.");
    } else {
      throw new Error("Error setting up request: " + error.message);
    }
  }
};

// ✅ Reset Password
const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error;
    } else if (error.request) {
      throw new Error("No response received from server. Please check your connection.");
    } else {
      throw new Error("Error setting up request: " + error.message);
    }
  }
};

// ✅ Validate Token
const validateToken = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/validate-token`, { token });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error;
    } else {
      throw new Error("Error validating token");
    }
  }
};

export default { register, login, resetPassword, validateToken };
