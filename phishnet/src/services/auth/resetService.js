import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Update with actual backend URL

const requestPasswordReset = async (email) => {
  return axios.post(`${API_URL}/forgot-password`, { email });
};

export default { requestPasswordReset };
