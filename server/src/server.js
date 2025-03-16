import express from "express";
import cors from "cors";
import { config } from "dotenv";
import sequelize from "./config/database.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Update path

config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Sync database
sequelize.sync().then(() => {
  console.log("📦 Database connected!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
