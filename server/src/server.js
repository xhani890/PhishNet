import express from "express";  // ✅ Use `import` instead of `require`
import dotenv from "dotenv";     // ✅ For environment variables
import cors from "cors";         // ✅ Allow frontend to access backend
import authRoutes from "./routes/authRoutes.js"; // ✅ Ensure `.js` extension
import mongoose from "mongoose"; // ✅ If using MongoDB

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

// ✅ Setup API Routes
app.use("/api/auth", authRoutes);

// ✅ Connect to MongoDB (if applicable)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
