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

    // Send simple welcome email (mobile-friendly & spam-safe)
    try {
      const plainText = `Welcome to QuantumChem, ${user.name}!

Your account has been successfully created using Google Sign-In.

Account Details:
- Name: ${user.name}
- Email: ${user.email}
- Login Method: Google Authentication
- Login Time: ${new Date().toLocaleString()}

Access your dashboard: ${FRONTEND_URL}/profile.html

Thank you,
QuantumChem Team

This is an automated message. If you didn't create this account, please contact support@quantumchem.site`;

      const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to QuantumChem</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #2563eb;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            margin: 20px 0;
        }
        .user-info {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            margin: 15px 0;
        }
        .info-item {
            margin: 10px 0;
            display: flex;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 140px;
        }
        .info-value {
            color: #111827;
        }
        .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        @media (max-width: 600px) {
            body {
                padding: 15px;
            }
            .info-item {
                flex-direction: column;
            }
            .info-label {
                margin-bottom: 5px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">QuantumChem</div>
        <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Laboratory Database</div>
    </div>
    
    <div class="content">
        <h2 style="color: #111827; margin-top: 0;">Welcome, ${user.name}!</h2>
        <p>Your account has been successfully created using Google Sign-In.</p>
        
        <div class="user-info">
            <div class="info-item">
                <div class="info-label">Name:</div>
                <div class="info-value">${user.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email:</div>
                <div class="info-value">${user.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Login Method:</div>
                <div class="info-value">Google Authentication</div>
            </div>
            <div class="info-item">
                <div class="info-label">Login Time:</div>
                <div class="info-value">${new Date().toLocaleString()}</div>
            </div>
        </div>
        
        <p>You can now access all features of QuantumChem:</p>
        <ul style="color: #4b5563;">
            <li>Chemical database with 10,000+ compounds</li>
            <li>Research tools and calculations</li>
            <li>Secure collaboration features</li>
        </ul>
        
        <a href="${FRONTEND_URL}/profile.html" class="button">Access Your Dashboard</a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding: 15px; background: #e0f2fe; border-radius: 6px;">
            <strong>Security Note:</strong> Your account is secured with Google authentication. No password is stored.
        </p>
    </div>
    
    <div class="footer">
        <p>© 2026 QuantumChem Research Platform</p>
        <p>This is an automated message. If you didn't create this account, please contact <a href="mailto:support@quantumchem.site" style="color: #2563eb;">support@quantumchem.site</a></p>
        <p style="margin-top: 10px;">
            <a href="${FRONTEND_URL}" style="color: #2563eb; margin: 0 10px;">Home</a> | 
            <a href="${FRONTEND_URL}/profile.html" style="color: #2563eb; margin: 0 10px;">Profile</a> | 
            <a href="mailto:support@quantumchem.site" style="color: #2563eb; margin: 0 10px;">Support</a>
        </p>
    </div>
</body>
</html>`;

      await sendEmail({
        to: user.email,
        subject: "Welcome to QuantumChem - Account Created Successfully",
        html: htmlEmail,
        text: plainText  // IMPORTANT: Plain text version reduces spam
      });
      console.log("📧 Welcome email sent to:", user.email);
    } catch (emailError) {
      console.error("⚠️ Email failed:", emailError.message);
      // Don't fail the login if email fails
    }

    // DEBUG: Print the redirect URL before redirecting
    console.log("🔍 DEBUG - Building redirect URL:");
    console.log("   FRONTEND_URL:", FRONTEND_URL);
    console.log("   Token exists:", token ? "YES" : "NO");
    
    // Build redirect URL
    const redirectUrl = `${FRONTEND_URL}/profile.html?token=${token}&google_auth=true`;
    
    console.log("🎯 FINAL REDIRECT URL:", redirectUrl);
    console.log("=== GOOGLE CALLBACK END ===");
    
    // Clear any headers that might interfere
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    // Redirect to profile.html
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Google callback error:");
    console.error("Message:", error.message);
    
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