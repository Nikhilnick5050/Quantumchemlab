import express from "express";
import axios from "axios";
import { googleCallback } from "../controllers/googleAuth.controller.js";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // UPDATED: Add FRONTEND_URL

// =======================
// REDIRECT TO GOOGLE
// =======================
router.get("/google", (req, res) => {
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  const googleAuthURL =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  res.redirect(googleAuthURL);
});

// =======================
// GOOGLE CALLBACK
// =======================
router.get("/google/callback", async (req, res, next) => {
  try {
    const { code } = req.query;

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }
    );

    const { id_token } = tokenRes.data;

    // Verify token
    const payload = await (
      await import("../services/google.service.js")
    ).verifyGoogleToken(id_token);

    req.user = payload;
    next();
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    // UPDATED: Use FRONTEND_URL for error redirect
    res.redirect(`${FRONTEND_URL}/login.html`);
  }
}, googleCallback);

export default router;