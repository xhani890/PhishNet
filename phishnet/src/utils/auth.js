import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    return decoded.id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};