import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import sequelize from "../config/database.js";
import { User } from "../models/User.js"; // Make sure to export User in your User model
import sendEmail from "../config/email.js";
import { Sequelize } from "sequelize";
import passwordResetTemplate from "../utils/passwordResetTemplate.js";

dotenv.config();

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username: name, // Assuming your model uses username field
      email,
      password_hash: hashedPassword, // Make sure this matches your DB column name
      firstName: name.split(' ')[0],
      lastName: name.split(' ').length > 1 ? name.split(' ')[1] : '',
      role: 'user',
      isActive: true
    });

    // Return success but don't include the password hash
    res.status(201).json({
      message: "Registration successful! You can now log in.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "An error occurred during registration" });
  }
});

// ✅ Forgot Password Route (Restored)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Try to find user by email
    const user = await User.findOne({ where: { email } });

    // 🧪 If user exists, generate token and send email
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await sequelize.query(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expiresAt)",
        {
          replacements: { user_id: user.id, token, expiresAt },
          type: Sequelize.QueryTypes.INSERT,
        }
      );

      const resetLink = `http://localhost:5173/reset-password?token=${token}`;
      const emailHtml = passwordResetTemplate(user.name, resetLink);
      await sendEmail(user.email, "🔑 Password Reset Request", emailHtml);
    }

    // ✅ ALWAYS respond with success message (even if user doesn't exist)
    res.json({ message: "📧 Password reset link sent to your email (if registered)!" });

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
