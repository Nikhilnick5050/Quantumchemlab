import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../services/brevo.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Function to get the correct frontend URL based on environment
const getFrontendUrl = () => {
  console.log("🔍 Environment check:");
  console.log("   VERCEL:", process.env.VERCEL);
  console.log("   NODE_ENV:", process.env.NODE_ENV);
  console.log("   FRONTEND_URL_PROD:", process.env.FRONTEND_URL_PROD);
  console.log("   FRONTEND_URL_LOCAL:", process.env.FRONTEND_URL_LOCAL);
  
  if (process.env.VERCEL) {
    return process.env.FRONTEND_URL_PROD || "https://www.quantumchem.site";
  }
  return process.env.FRONTEND_URL_LOCAL || "http://localhost:3000";
};

export const googleCallback = async (req, res) => {
  const FRONTEND_URL = getFrontendUrl();
  
  try {
    console.log("=== GOOGLE CALLBACK START ===");
    console.log("🌐 Frontend URL:", FRONTEND_URL);
    console.log("👤 User data:", JSON.stringify(req.user, null, 2));

    // Check if user data exists
    if (!req.user) {
      console.error("❌ No user data from Google");
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

    console.log(`🔍 Processing Google user: ${email}`);

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
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update existing user
      console.log("👤 Updating existing user");
      
      user.googleId = id;
      user.authProvider = "google";
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      
      if (!user.name && name) {
        user.name = name;
      }
    }

    // Save user
    await user.save();
    console.log("✅ User saved successfully");

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
      picture: user.profilePicture
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });
    console.log("✅ JWT token generated");

    // Send beautiful welcome email (async - don't wait for response)
    try {
      await sendEmail({
        to: user.email,
        subject: "🚀 Welcome to QuantumChem - Your Research Journey Begins!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
              body {
                font-family: 'Inter', sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                border: 1px solid #e2e8f0;
              }
              .header {
                background: linear-gradient(135deg, #0B1220 0%, #0F1B2E 100%);
                padding: 40px 30px;
                text-align: center;
                border-bottom: 3px solid #3B82F6;
              }
              .logo {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                margin-bottom: 20px;
              }
              .logo-icon {
                font-size: 36px;
                color: #3B82F6;
              }
              .logo-text {
                font-family: 'Poppins', sans-serif;
                font-weight: 700;
                font-size: 28px;
                color: white;
              }
              .logo-text span {
                color: #3B82F6;
              }
              .tagline {
                color: #9CA3AF;
                font-size: 14px;
                letter-spacing: 0.5px;
                margin-top: 5px;
              }
              .content {
                padding: 40px 30px;
              }
              .welcome-title {
                font-family: 'Poppins', sans-serif;
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 15px;
                text-align: center;
              }
              .welcome-subtitle {
                color: #64748b;
                font-size: 16px;
                text-align: center;
                line-height: 1.6;
                margin-bottom: 30px;
              }
              .user-info {
                background: #f1f5f9;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #3B82F6;
              }
              .info-item {
                display: flex;
                margin-bottom: 15px;
                align-items: center;
              }
              .info-item:last-child {
                margin-bottom: 0;
              }
              .info-icon {
                width: 40px;
                height: 40px;
                background: #e0f2fe;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                color: #0369a1;
                flex-shrink: 0;
              }
              .info-details {
                flex: 1;
              }
              .info-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 3px;
              }
              .info-value {
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
              }
              .features {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 30px 0;
              }
              .feature-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                border: 1px solid #e2e8f0;
                transition: all 0.3s ease;
              }
              .feature-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border-color: #3B82F6;
              }
              .feature-icon {
                font-size: 24px;
                color: #3B82F6;
                margin-bottom: 10px;
              }
              .feature-title {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 5px;
                font-size: 14px;
              }
              .feature-desc {
                color: #64748b;
                font-size: 12px;
                line-height: 1.4;
              }
              .cta-button {
                display: block;
                width: 100%;
                background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
                color: white;
                text-align: center;
                padding: 16px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                margin: 30px 0;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
              }
              .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
              }
              .security-note {
                background: #d1fae5;
                border: 1px solid #a7f3d0;
                border-radius: 12px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
              }
              .security-icon {
                color: #10b981;
                font-size: 24px;
                margin-bottom: 10px;
              }
              .security-text {
                color: #065f46;
                font-size: 14px;
                font-weight: 500;
              }
              .footer {
                background: #0F1B2E;
                color: #9CA3AF;
                padding: 25px;
                text-align: center;
                font-size: 12px;
                line-height: 1.6;
                border-top: 1px solid #1F2937;
              }
              .footer a {
                color: #3B82F6;
                text-decoration: none;
              }
              .footer-links {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
              }
              .login-time {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: #fef3c7;
                color: #92400e;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                margin: 10px 0;
              }
              @media (max-width: 600px) {
                .features {
                  grid-template-columns: 1fr;
                }
                .content {
                  padding: 25px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <div class="logo-icon">⚛️</div>
                  <div>
                    <div class="logo-text">Quantum<span>Chem</span></div>
                    <div class="tagline">Advanced Research Laboratory Database</div>
                  </div>
                </div>
              </div>
              
              <div class="content">
                <h1 class="welcome-title">Welcome aboard, ${user.name}! 🎉</h1>
                <p class="welcome-subtitle">Your quantum chemistry research journey begins now. Explore advanced tools, databases, and collaborative features.</p>
                
                <div class="user-info">
                  <div class="info-item">
                    <div class="info-icon">
                      <span>👤</span>
                    </div>
                    <div class="info-details">
                      <div class="info-label">Account Created</div>
                      <div class="info-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-icon">
                      <span>📧</span>
                    </div>
                    <div class="info-details">
                      <div class="info-label">Registered Email</div>
                      <div class="info-value">${user.email}</div>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-icon">
                      <span>🔐</span>
                    </div>
                    <div class="info-details">
                      <div class="info-label">Authentication Method</div>
                      <div class="info-value">Google Sign-In (Secure)</div>
                    </div>
                  </div>
                  
                  <div class="login-time">
                    <span>🕒</span>
                    Login time: ${new Date().toLocaleString()}
                  </div>
                </div>
                
                <div class="features">
                  <div class="feature-card">
                    <div class="feature-icon">🧪</div>
                    <div class="feature-title">Chemical Database</div>
                    <div class="feature-desc">Access 10,000+ chemical compounds with detailed properties</div>
                  </div>
                  
                  <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Research Tools</div>
                    <div class="feature-desc">Advanced calculation and visualization tools</div>
                  </div>
                  
                  <div class="feature-card">
                    <div class="feature-icon">🤝</div>
                    <div class="feature-title">Collaboration</div>
                    <div class="feature-desc">Share research with team members securely</div>
                  </div>
                  
                  <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Security</div>
                    <div class="feature-desc">Enterprise-grade encryption & data protection</div>
                  </div>
                </div>
                
                <div class="security-note">
                  <div class="security-icon">✅</div>
                  <div class="security-text">Your account is secured with Google authentication. No password required.</div>
                </div>
                
                <a href="${FRONTEND_URL}/profile.html" class="cta-button">
                  🚀 Launch Your Dashboard
                </a>
              </div>
              
              <div class="footer">
                <p>© 2026 QuantumChem Research Platform. All rights reserved.</p>
                <p>This is an automated message. If you didn't create this account, please <a href="mailto:support@quantumchem.site">contact support</a> immediately.</p>
                <div class="footer-links">
                  <a href="${FRONTEND_URL}">Home</a>
                  <a href="${FRONTEND_URL}/profile.html">Profile</a>
                  <a href="https://quantumchemblog.wordpress.com/">Blog</a>
                  <a href="mailto:support@quantumchem.site">Support</a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log("📧 Beautiful welcome email sent to:", user.email);
    } catch (emailError) {
      console.error("⚠️ Email failed:", emailError.message);
    }

    // DEBUG: Print the redirect URL before redirecting
    console.log("🔍 DEBUG - Building redirect URL:");
    console.log("   FRONTEND_URL:", FRONTEND_URL);
    console.log("   Token exists:", token ? "YES" : "NO");
    console.log("   Token length:", token?.length || 0);
    
    // Build redirect URL - FIXED: Redirect to profile.html instead of index.html
    const redirectUrl = `${FRONTEND_URL}/profile.html?token=${token}&google_auth=true`;
    
    console.log("🎯 FINAL REDIRECT URL:", redirectUrl);
    console.log("✅ Should redirect to profile.html, NOT index.html");
    console.log("=== GOOGLE CALLBACK END ===");
    
    // IMPORTANT: Clear any headers that might interfere
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    // Redirect to profile.html
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Google callback error:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    const errorUrl = `${FRONTEND_URL}/login.html?error=google_auth_failed`;
    console.log("⚠️ Redirecting to error page:", errorUrl);
    
    res.redirect(errorUrl);
  }
};

// Test endpoint for debugging
export const testGoogleAuth = async (req, res) => {
  console.log("🔍 Test endpoint called");
  res.json({
    status: "Google Auth API is working",
    timestamp: new Date().toISOString(),
    frontendUrl: getFrontendUrl(),
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL_PROD,
    vercel: process.env.VERCEL ? "YES" : "NO"
  });
};

// Get Google OAuth URL
export const getGoogleAuthUrl = async (req, res) => {
  try {
    const callbackUrl = process.env.VERCEL 
      ? process.env.GOOGLE_CALLBACK_URL_PROD 
      : process.env.GOOGLE_CALLBACK_URL_LOCAL;
    
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