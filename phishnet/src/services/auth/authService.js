import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // ✅ Ensure this is correct

// ✅ Register User
const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, { name, email, password });
  return response.data; // ✅ Return only the data
};

// ✅ Login User
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // ✅ Return only the data
};

export default { register, login };
