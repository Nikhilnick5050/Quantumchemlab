import express from "express";
import axios from "axios";
import { googleCallback } from "../controllers/googleAuth.controller.js";

const router = express.Router();

// =======================
// GOOGLE AUTH
// =======================
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  
  console.log("🌐 Google OAuth initiated");
  console.log("Client ID:", clientId ? "Set" : "Not set");
  console.log("Callback URL:", callbackUrl);
  
  if (!clientId || !callbackUrl) {
    console.error("❌ Google OAuth not configured");
    return res.status(500).json({ error: "Google OAuth not configured" });
  }
  
  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email%20profile&access_type=offline&prompt=select_account`;
  
  console.log("Redirecting to Google:", googleAuthURL);
  res.redirect(googleAuthURL);
});

// =======================
// GOOGLE CALLBACK
// =======================
router.get("/google/callback", async (req, res) => {
  try {
    console.log("🔄 Google callback received");
    const { code, error } = req.query;
    
    if (error) {
      console.error("Google error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/login.html?error=${error}`);
    }
    
    if (!code) {
      console.error("No authorization code");
      return res.redirect(`${process.env.FRONTEND_URL}/login.html?error=no_code`);
    }
    
    console.log("Exchanging code for tokens...");
    
    // Exchange code for tokens
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }
    );
    
    const { id_token } = tokenRes.data;
    
    if (!id_token) {
      throw new Error("No ID token received");
    }
    
    console.log("Verifying Google token...");
    
    // Verify token
    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    console.log("✅ Google user verified:", payload.email);
    
    // Format user data for your controller
    req.user = {
      id: payload.sub,
      displayName: payload.name,
      emails: [{ value: payload.email }],
      photos: payload.picture ? [{ value: payload.picture }] : [],
      email_verified: payload.email_verified
    };
    
    // Call your existing controller
    await googleCallback(req, res);
    
  } catch (error) {
    console.error("❌ Google auth error:", error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login.html?error=auth_failed`);
  }
});

export default router;