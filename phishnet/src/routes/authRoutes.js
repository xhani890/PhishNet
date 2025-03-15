import express from "express";  // ✅ Use `import` instead of `require`
import { forgotPassword, login, register } from "../controllers/authController.js"; // ✅ Ensure .js extension in imports

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);

export default router;
