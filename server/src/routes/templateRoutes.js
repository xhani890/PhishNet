import express from "express";
import { 
  sendTestEmail, 
  createTemplate, 
  getTemplates, 
  getTemplateById, 
  updateTemplate, 
  deleteTemplate 
} from "../controllers/templateController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTemplate);
router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);
router.post("/test", sendTestEmail);

export default router;