import express from "express";
import axios from "axios";
import { googleCallback } from "../controllers/googleAuth.controller.js";
import { verifyGoogleToken } from "../services/google.service.js";

const router = express.Router();

// =======================
// GOOGLE AUTH INITIATE
// =======================
router.get("/google", (req, res) => {
  try {
    console.log("🌐 Google OAuth initiated");
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    console.log("Checking environment variables:");
    console.log("- GOOGLE_CLIENT_ID:", clientId ? "✓ Set" : "✗ Missing");
    console.log("- GOOGLE_CALLBACK_URL:", callbackUrl || "✗ Missing");
    console.log("- FRONTEND_URL:", frontendUrl);
    
    if (!clientId) {
      console.error("❌ GOOGLE_CLIENT_ID is missing");
      return res.status(500).json({ 
        error: "Google OAuth not configured",
        message: "GOOGLE_CLIENT_ID is missing from environment variables"
      });
    }
    
    if (!callbackUrl) {
      console.error("❌ GOOGLE_CALLBACK_URL is missing");
      // Redirect to frontend with error
      return res.redirect(`${frontendUrl}/login.html?error=callback_not_set`);
    }
    
    console.log("✅ Building Google OAuth URL...");
    console.log("Callback URL:", callbackUrl);
    
    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account"
    });
    
    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    console.log("🔗 Redirecting to:", googleAuthURL);
    res.redirect(googleAuthURL);
    
  } catch (error) {
    console.error("❌ Error in Google OAuth:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/login.html?error=oauth_init_failed`);
  }
});

// =======================
// GOOGLE CALLBACK
// =======================
router.get("/google/callback", async (req, res) => {
  try {
    console.log("🔄 Google callback received");
    
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    if (error) {
      console.error("❌ Google returned error:", error);
      return res.redirect(`${frontendUrl}/login.html?error=google_${error}`);
    }
    
    if (!code) {
      console.error("❌ No authorization code received");
      return res.redirect(`${frontendUrl}/login.html?error=no_code`);
    }
    
    console.log("✅ Authorization code received");
    
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
      console.error("❌ Missing Google OAuth configuration");
      return res.redirect(`${frontendUrl}/login.html?error=config_missing`);
    }
    
    console.log("📝 Exchanging code for tokens...");
    
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    console.log("✅ Token exchange successful");
    
    const { id_token } = tokenResponse.data;
    
    if (!id_token) {
      throw new Error("No ID token received from Google");
    }
    
    // Verify the ID token
    const googleUser = await verifyGoogleToken(id_token);
    
    console.log("✅ Google user verified:", googleUser.email);
    
    // Create request object for googleCallback
    const request = {
      user: {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        email_verified: googleUser.email_verified
      }
    };
    
    // Call the googleCallback controller
    await googleCallback(request, res);
    
  } catch (error) {
    console.error("❌ Google callback error:");
    console.error("Message:", error.message);
    
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status:", error.response.status);
    }
    
    res.redirect(`${frontendUrl}/login.html?error=auth_failed`);
  }
});

// =======================
// TEST ENDPOINT
// =======================
router.get("/google/test", (req, res) => {
  res.json({
    status: "Google Auth API is working",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✓ SET" : "✗ NOT SET",
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "✗ NOT SET",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    timestamp: new Date().toISOString()
  });
});

export default router;