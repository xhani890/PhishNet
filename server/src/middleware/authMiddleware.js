import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';  // Use named import directly

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    // Optional: Check if user still exists in database
    const userExists = await User.findByPk(decoded.id);
    if (!userExists) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found or deleted.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};