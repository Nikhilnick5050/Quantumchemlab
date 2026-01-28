import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../services/brevo.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const googleCallback = async (req, res) => {
  try {
    console.log("🟢 Google callback started");
    console.log("User data from Google:", JSON.stringify(req.user, null, 2));

    // Check if user data exists
    if (!req.user) {
      console.error("❌ No user data received from Google");
      return res.redirect(`${FRONTEND_URL}/login.html?error=no_user_data`);
    }

    // Extract user data
    const { id, displayName, emails, photos } = req.user;
    const email = emails && emails[0] ? emails[0].value : null;
    const name = displayName || "Google User";
    const picture = photos && photos[0] ? photos[0].value : "";

    // Validate required fields
    if (!email) {
      console.error("❌ No email from Google");
      return res.redirect(`${FRONTEND_URL}/login.html?error=no_email`);
    }

    if (!id) {
      console.error("❌ No Google ID");
      return res.redirect(`${FRONTEND_URL}/login.html?error=no_google_id`);
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find user by email OR googleId
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: id }
      ]
    });

    if (!user) {
      // Create new user
      console.log("👤 Creating new user");
      user = new User({
        name,
        email,
        authProvider: "google",
        googleId: id,
        isEmailVerified: true,
        profilePicture: picture,
        createdAt: new Date()
      });
    } else {
      // Update existing user
      console.log("👤 Updating existing user:", user.email);
      
      // Update googleId if missing
      if (!user.googleId) {
        user.googleId = id;
      }
      
      // Update authProvider to google
      user.authProvider = "google";
      
      // Update profile picture if available and not set
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      
      // Update name if not set
      if (!user.name && name) {
        user.name = name;
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    
    // Save user
    await user.save();
    console.log("✅ User saved:", user.email);

    // Send welcome email (async - don't wait)
    setTimeout(async () => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Welcome to QuantumChem 🚀",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Welcome ${user.name}!</h2>
              <p>You have successfully logged into QuantumChem using Google.</p>
              <p><strong>Login Details:</strong></p>
              <ul>
                <li>Email: ${user.email}</li>
                <li>Time: ${new Date().toLocaleString()}</li>
                <li>Method: Google OAuth</li>
              </ul>
              <p>If this wasn't you, please contact support immediately.</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                This is an automated message from QuantumChem.
              </p>
            </div>
          `,
        });
        console.log("📧 Welcome email sent to:", user.email);
      } catch (emailError) {
        console.error("❌ Email failed:", emailError.message);
      }
    }, 0);

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
      authProvider: user.authProvider
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ JWT generated, redirecting to frontend");
    console.log("Frontend URL:", FRONTEND_URL);
    console.log("Token length:", token.length);

    // Redirect to frontend with token
    const redirectUrl = `${FRONTEND_URL}/profile.html?token=${token}&success=true&name=${encodeURIComponent(user.name)}`;
    console.log("Redirect URL:", redirectUrl);
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Google callback error:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Redirect to login with error
    const errorUrl = `${FRONTEND_URL}/login.html?error=google_auth_failed&message=${encodeURIComponent(error.message)}`;
    console.log("Error redirect URL:", errorUrl);
    
    res.redirect(errorUrl);
  }
};

// Test endpoint for debugging
export const testGoogleAuth = async (req, res) => {
  res.json({
    status: "Google Auth API is working",
    timestamp: new Date().toISOString(),
    frontendUrl: FRONTEND_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
    nodeEnv: process.env.NODE_ENV,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  });
};

// Get Google OAuth URL
export const getGoogleAuthUrl = async (req, res) => {
  try {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      return res.status(500).json({
        error: "Google Client ID not configured"
      });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=profile email&access_type=offline&prompt=select_account`;
    
    res.json({
      authUrl,
      callbackUrl,
      clientId: clientId.substring(0, 10) + "..."
    });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
};