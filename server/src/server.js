import express from "express";
import cors from "cors";
import { config } from "dotenv";
import sequelize from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
// Change from default import to named import
import { Template } from "./models/Template.js";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
config();

const app = express();
app.use(express.json());
app.use(cors());

// Verify required environment variables
const requiredEnvVars = [
  'DB_NAME', 
  'DB_USER', 
  'DB_PASSWORD', 
  'JWT_SECRET', 
  'EMAIL_USER', 
  'EMAIL_PASS',
  'EMAIL_FROM'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Database connection
sequelize.authenticate()
  .then(() => console.log('📦 Database connected successfully'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  rateLimit: true,
  maxConnections: 1,
  maxMessages: 5
});

// Verify email configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Security middleware
app.use(helmet());
app.disable('x-powered-by');

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Database synchronization
sequelize.sync({ alter: true }).then(() => {
  console.log("📦 Database models synchronized");
}).catch(err => {
  console.error('❌ Database sync error:', err);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server terminated');
    process.exit(0);
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});