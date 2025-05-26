import express from "express";
import { 
  sendTestEmailHandler, 
  createTemplate, 
  getTemplates, 
  getTemplateById, 
  updateTemplate, 
  deleteTemplate,
  healthCheck
} from "../controllers/templateController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Health check route
router.get("/health", healthCheck);

// Template CRUD routes
router.post("/", createTemplate);
router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

// Test email route
router.post("/test-email", sendTestEmailHandler);

export default router;