import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// =======================
// JWT AUTH MIDDLEWARE
// =======================
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// =======================
// GET USER PROFILE
// =======================
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -verificationToken"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
