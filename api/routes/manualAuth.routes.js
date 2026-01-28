import express from "express";
import {
  registerManual,
  loginManual,
  verifyEmail,
  resetPasswordManual, // ✅ ADD THIS
} from "../controllers/manualAuth.controller.js";

const router = express.Router();

router.post("/register", registerManual);
router.post("/login", loginManual);
router.get("/verify/:token", verifyEmail);

// ✅ ALWAYS AVAILABLE RESET PASSWORD
router.post("/reset-password", resetPasswordManual);

export default router;
