import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Update with actual backend URL

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

const logout = () => {
  localStorage.removeItem("authToken");
};

export default { login, logout };
