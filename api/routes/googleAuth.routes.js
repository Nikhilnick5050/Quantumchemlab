import express from "express";
import axios from "axios";
import { googleCallback } from "../controllers/googleAuth.controller.js";

const router = express.Router();

// Helper to get frontend URL (matching controller logic)
const getFrontendUrl = () => {
  if (process.env.VERCEL) {
    return process.env.FRONTEND_URL_PROD || "https://www.quantumchem.site";
  }
  return process.env.FRONTEND_URL_LOCAL || "http://localhost:3000";
};

// Helper to get callback URL
const getCallbackUrl = () => {
  if (process.env.VERCEL) {
    return process.env.GOOGLE_CALLBACK_URL_PROD;
  }
  return process.env.GOOGLE_CALLBACK_URL_LOCAL;
};

// Error redirect helper (uses environment-aware URL)
const redirectToLoginWithError = (res, errorType, errorMessage = "") => {
  const frontendUrl = getFrontendUrl();
  let redirectUrl = `${frontendUrl}/login.html?error=${errorType}`;
  
  if (errorMessage) {
    redirectUrl += `&message=${encodeURIComponent(errorMessage)}`;
  }
  
  console.log(`⚠️ Redirecting to: ${redirectUrl}`);
  return res.redirect(redirectUrl);
};

// Google OAuth initiation
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = getCallbackUrl();
  
  console.log("=== GOOGLE OAUTH INITIATION ===");
  console.log("🌐 Origin:", req.headers.origin);
  console.log("🔑 Client ID:", clientId ? "SET" : "MISSING");
  console.log("📞 Callback URL:", callbackUrl);
  console.log("🌍 Frontend URL:", getFrontendUrl());

  if (!clientId || !callbackUrl) {
    console.error("❌ Google OAuth not configured");
    return res.status(500).json({ 
      error: "Google OAuth not configured",
      frontendUrl: getFrontendUrl() // Include for debugging
    });
  }

  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email%20profile&access_type=offline&prompt=select_account`;
  
  console.log("↪️ Redirecting to Google");
  res.redirect(googleAuthURL);
});

// Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    console.log("=== GOOGLE CALLBACK RECEIVED ===");
    console.log("🔍 Query params:", req.query);
    console.log("🌍 Frontend URL:", getFrontendUrl());
    
    const { code, error } = req.query;
    
    if (error) {
      console.error("❌ Google returned error:", error);
      return redirectToLoginWithError(res, "google_error", `Google auth error: ${error}`);
    }
    
    if (!code) {
      console.error("❌ No authorization code");
      return redirectToLoginWithError(res, "no_code", "No authorization code received");
    }
    
    const callbackUrl = getCallbackUrl();
    console.log("🔄 Exchanging code with callback:", callbackUrl);
    
    // Exchange code for tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token } = tokenRes.data;
    
    if (!access_token) {
      console.error("❌ No access token received");
      return redirectToLoginWithError(res, "no_token", "Failed to get access token from Google");
    }
    
    console.log("✅ Got access token");
    
    // Get user info from Google
    const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const googleUser = userInfoRes.data;
    console.log("✅ Google user:", googleUser.email);
    
    // Format for your controller
    req.user = {
      id: googleUser.id,
      displayName: googleUser.name,
      emails: [{ value: googleUser.email }],
      photos: googleUser.picture ? [{ value: googleUser.picture }] : [],
      email_verified: googleUser.verified_email
    };
    
    // Call your controller - it handles all auth logic
    await googleCallback(req, res);
    
  } catch (error) {
    console.error("❌ Google callback error:", error.message);
    console.error("Full error:", error.response?.data || error);
    
    // Use helper for consistent redirect
    return redirectToLoginWithError(res, "auth_failed", error.message);
  }
});

export default router;