import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/User.js";
import sendEmail from "../config/email.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import passwordResetTemplate from "../utils/passwordResetTemplate.js"; // ✅ Import Email Template

dotenv.config();

const router = express.Router();

// ✅ Forgot Password Route (Restored)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email!" });
    }

    // 🔑 Generate Secure Reset Token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token expires in 15 minutes

    // 💾 Store Reset Token in Database
    await sequelize.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expiresAt)",
      {
        replacements: { user_id: user.id, token, expiresAt },
        type: Sequelize.QueryTypes.INSERT,
      }
    );

    // ✉️ Send Password Reset Email with User’s Name
    const resetLink = `http://localhost:5173/reset-password?token=${token}`; // ✅ Fix: Use correct frontend port
    const emailHtml = passwordResetTemplate(user.name, resetLink);

    await sendEmail(user.email, "🔑 Password Reset Request", emailHtml);

    res.json({ message: "📧 Password reset email sent!" });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in DB
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error!" });
  }
});



// ✅ Reset Password Route (Prevents Reusing Old Password)
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 🔍 Find Token in Database
    const tokenData = await sequelize.query(
      "SELECT * FROM password_reset_tokens WHERE token = :token AND expires_at > NOW()",
      {
        replacements: { token },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!tokenData.length) {
      return res.status(400).json({ message: "❌ Invalid or expired token!" });
    }

    const userId = tokenData[0].user_id;

    // 🔍 Fetch User's Current Hashed Password
    const user = await sequelize.query(
      "SELECT password_hash FROM users WHERE id = :userId",
      {
        replacements: { userId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!user.length) {
      return res.status(400).json({ message: "❌ User not found!" });
    }

    const currentHashedPassword = user[0].password_hash;

    // 🔄 Compare New Password with Old One
    const isSamePassword = await bcrypt.compare(newPassword, currentHashedPassword);
    if (isSamePassword) {
      return res.status(400).json({ message: "⚠ You cannot use the same password as before!" });
    }

    // 🔑 Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔄 Update User Password
    await sequelize.query(
      "UPDATE users SET password_hash = :hashedPassword WHERE id = :userId",
      {
        replacements: { hashedPassword, userId },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    // 🗑️ Delete Used Token (Invalidate it)
    await sequelize.query(
      "DELETE FROM password_reset_tokens WHERE token = :token",
      {
        replacements: { token },
        type: Sequelize.QueryTypes.DELETE,
      }
    );

    res.json({ message: "✅ Password reset successful! This link can no longer be used." });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ Validate Token Before Reset Page Loads
router.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;
    const tokenData = await sequelize.query(
      "SELECT * FROM password_reset_tokens WHERE token = :token AND expires_at > NOW()",
      {
        replacements: { token },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!tokenData.length) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ valid: false, message: "Server error!" });
  }
});

export default router;
