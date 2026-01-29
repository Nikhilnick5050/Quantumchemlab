import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../services/brevo.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PASSWORD_VALID_DAYS = 4;

// Generate readable temp password
const generateTempPassword = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";

  let password = "";

  // 4 letters
  for (let i = 0; i < 4; i++) {
    password += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // 4 digits
  for (let i = 0; i < 4; i++) {
    password += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  // Shuffle characters
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// REGISTER (MANUAL) - name + email ONLY
export const registerManual = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const verificationToken = uuidv4();

    await User.create({
      name,
      email,
      password: null,
      authProvider: "manual",
      isEmailVerified: false,
      verificationToken,
    });

    const verifyLink = `${FRONTEND_URL}/api/auth/verify/${verificationToken}`;

    const plainText = `Welcome to QuantumChem!

Please verify your email to receive your login password.

Verification Link: ${verifyLink}

This link will verify your email address and generate a secure temporary password for you.

Thank you,
QuantumChem Team`;

    await sendEmail({
      to: email,
      subject: "Verify your QuantumChem account",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your QuantumChem Account</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            padding: 25px;
            background: #f9fafb;
            border-radius: 10px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 25px 0;
            border: none;
        }
        .info-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        @media (max-width: 600px) {
            body {
                padding: 15px;
            }
            .content {
                padding: 20px;
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
        <h2 style="color: #111827; margin-top: 0;">Welcome to QuantumChem!</h2>
        
        <div class="info-box">
            <p style="margin: 0 0 15px 0;">Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering with QuantumChem. Please verify your email address to receive your secure login password.</p>
        </div>
        
        <p>Click the button below to verify your email:</p>
        
        <a href="${verifyLink}" class="button">Verify Email Address</a>
        
        <p style="color: #6b7280; font-size: 14px;">Or copy this link:</p>
        <p style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; word-break: break-all; font-size: 14px;">
            ${verifyLink}
        </p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Note:</strong> After verification, you'll receive a temporary password valid for ${PASSWORD_VALID_DAYS} days.
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2026 QuantumChem Research Platform</p>
        <p>This link expires in 24 hours. If you didn't request this, please ignore this email.</p>
    </div>
</body>
</html>`,
      text: plainText
    });

    res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// VERIFY EMAIL - Generates TEMP PASSWORD
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send("Invalid or expired verification link");
    }

    // Generate readable temp password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.passwordExpiresAt = new Date(
      Date.now() + PASSWORD_VALID_DAYS * 24 * 60 * 60 * 1000
    );

    await user.save();

    const plainText = `Hello ${user.name},

Your QuantumChem account has been successfully verified!

Your temporary login password: ${tempPassword}

This password is valid for ${PASSWORD_VALID_DAYS} days (until ${user.passwordExpiresAt.toLocaleDateString()}).

Login here: ${FRONTEND_URL}/login.html

Security Tips:
• This is a temporary password
• You can reset it anytime from the login page
• Never share your password with anyone

Thank you,
QuantumChem Team`;

    await sendEmail({
      to: user.email,
      subject: "Your QuantumChem Login Password",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your QuantumChem Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #10b981;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 25px;
            background: #f9fafb;
            border-radius: 10px;
            margin: 20px 0;
        }
        .password-box {
            background: white;
            padding: 25px;
            border-radius: 10px;
            border: 2px solid #e5e7eb;
            text-align: center;
            margin: 25px 0;
            font-family: 'Courier New', monospace;
        }
        .password {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #111827;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            margin: 15px 0;
        }
        .info-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 140px;
        }
        .info-value {
            color: #111827;
        }
        .login-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 25px 0;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 18px;
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        @media (max-width: 600px) {
            body {
                padding: 15px;
            }
            .content {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">QuantumChem</div>
        <div style="color: #10b981; font-size: 14px; margin-top: 5px;">✓ Email Verified Successfully</div>
    </div>
    
    <div class="content">
        <h2 style="color: #111827; margin-top: 0;">Your Account is Ready!</h2>
        <p>Hello <strong>${user.name}</strong>, your email has been verified. Here's your temporary login password:</p>
        
        <div class="password-box">
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Temporary Password</div>
            <div class="password">${tempPassword}</div>
            <div style="color: #6b7280; font-size: 13px; margin-top: 10px;">
                Valid for ${PASSWORD_VALID_DAYS} days
            </div>
        </div>
        
        <div class="info-card">
            <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${user.name}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${user.email}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Valid Until:</div>
                <div class="info-value">${user.passwordExpiresAt.toLocaleDateString()}</div>
            </div>
        </div>
        
        <a href="${FRONTEND_URL}/login.html" class="login-button">Login to QuantumChem</a>
        
        <div class="security-note">
            <div style="color: #92400e; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Security Information</div>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                • This is a temporary password<br>
                • You can reset it anytime from the login page<br>
                • Never share your password with anyone
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2026 QuantumChem Research Platform</p>
        <p>If you didn't request this password, please contact <a href="mailto:quantumchem25@gmail.com" style="color: #2563eb;">quantumchem25@gmail.com</a></p>
    </div>
</body>
</html>`,
      text: plainText
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified - QuantumChem</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .success-box {
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-top: 4px solid #10b981;
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
          }
          h1 {
            color: #111827;
            margin-bottom: 15px;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 25px;
          }
          .password-info {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">✓</div>
          <h1>Email Verified Successfully!</h1>
          <p>Your email has been verified. A temporary password has been sent to your email address.</p>
          <div class="password-info">
            <p style="margin: 0; color: #111827; font-weight: 500;">Please check your inbox (and spam folder) for your password.</p>
          </div>
          <p>You can now login to QuantumChem using the password sent to your email.</p>
          <a href="${FRONTEND_URL}/login.html" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">Go to Login</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).send("Verification failed");
  }
};

// LOGIN (MANUAL) - UPDATED WITH WELCOME EMAIL
export const loginManual = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, authProvider: "manual" });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    // Check expiry
    if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
      return res.status(403).json({
        message: "Password expired. Please reset your password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send welcome email if this is their first login
    try {
      // Check if it's first login (no lastLoginAt or very old)
      const isFirstLogin = !user.lastLoginAt || 
        (new Date() - new Date(user.lastLoginAt)) > 24 * 60 * 60 * 1000;
      
      if (isFirstLogin) {
        const plainText = `Welcome to QuantumChem, ${user.name}!

Your manual login was successful!

Account Details:
- Name: ${user.name}
- Email: ${user.email}
- Login Method: Manual Authentication
- Login Time: ${new Date().toLocaleString()}

Access your dashboard: ${FRONTEND_URL}/profile.html

Security Note:
• Your password is valid until ${user.passwordExpiresAt.toLocaleDateString()}
• You can reset it anytime from the login page

Thank you,
QuantumChem Team

This is an automated message.`;

        await sendEmail({
          to: user.email,
          subject: "Welcome to QuantumChem - Login Successful",
          html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to QuantumChem</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #10b981;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 25px;
            background: #f9fafb;
            border-radius: 10px;
            margin: 20px 0;
        }
        .success-box {
            background: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .user-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 140px;
        }
        .info-value {
            color: #111827;
        }
        .dashboard-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 25px 0;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 18px;
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        @media (max-width: 600px) {
            body {
                padding: 15px;
            }
            .content {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-label {
                margin-bottom: 5px;
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
        <div class="success-box">
            <div style="color: #065f46; font-size: 16px; font-weight: 600; margin-bottom: 5px;">
                ✓ Login Successful
            </div>
            <p style="color: #065f46; margin: 0;">Welcome to QuantumChem, ${user.name}!</p>
        </div>
        
        <h2 style="color: #111827; margin-top: 0;">Great to have you back!</h2>
        <p>Your manual login was successful. You can now access all features of QuantumChem.</p>
        
        <div class="user-info">
            <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${user.name}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${user.email}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Login Method:</div>
                <div class="info-value">Manual Authentication</div>
            </div>
            <div class="info-row">
                <div class="info-label">Login Time:</div>
                <div class="info-value">${new Date().toLocaleString()}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Password Valid Until:</div>
                <div class="info-value">${user.passwordExpiresAt.toLocaleDateString()}</div>
            </div>
        </div>
        
        <a href="${FRONTEND_URL}/profile.html" class="dashboard-button">Go to Your Dashboard</a>
        
        <div class="security-note">
            <div style="color: #92400e; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Password Security</div>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                • Your password expires on ${user.passwordExpiresAt.toLocaleDateString()}<br>
                • You can reset it anytime from the login page<br>
                • Never share your password with anyone
            </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
            If you didn't login to your account, please contact support immediately.
        </p>
    </div>
    
    <div class="footer">
        <p>© 2026 QuantumChem Research Platform</p>
        <p>For security questions, contact <a href="mailto:quantumchem25@gmail.com" style="color: #2563eb;">quantumchem25@gmail.com</a></p>
        <p style="margin-top: 10px;">
            <a href="${FRONTEND_URL}" style="color: #2563eb; margin: 0 10px;">Home</a> | 
            <a href="${FRONTEND_URL}/profile.html" style="color: #2563eb; margin: 0 10px;">Profile</a> | 
            <a href="${FRONTEND_URL}/login.html" style="color: #2563eb; margin: 0 10px;">Login</a>
        </p>
    </div>
</body>
</html>`,
          text: plainText
        });
        console.log("📧 Welcome email sent for manual login:", user.email);
      }
    } catch (emailError) {
      console.error("⚠️ Welcome email failed:", emailError.message);
      // Don't fail login if email fails
    }

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// RESET PASSWORD (ALWAYS AVAILABLE)
export const resetPasswordManual = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, authProvider: "manual" });
    if (!user || !user.isEmailVerified) {
      return res.json({
        message: "This email is registered using Google Sign-In. Please continue with Google to access your account.",
      });
    }

    const newPassword = generateTempPassword();
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordExpiresAt = new Date(
      Date.now() + PASSWORD_VALID_DAYS * 24 * 60 * 60 * 1000
    );

    await user.save();

    const plainText = `Password Reset Request

Hello ${user.name},

Your QuantumChem password has been reset.

New temporary password: ${newPassword}

This password is valid for ${PASSWORD_VALID_DAYS} days (until ${user.passwordExpiresAt.toLocaleDateString()}).

Login here: ${FRONTEND_URL}/login.html

If you didn't request this reset, please contact support immediately.

Thank you,
QuantumChem Team
founder - Nikhil Shinde`;

    await sendEmail({
      to: user.email,
      subject: "Your New QuantumChem Password",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - QuantumChem</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f59e0b;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 25px;
            background: #f9fafb;
            border-radius: 10px;
            margin: 20px 0;
        }
        .password-display {
            background: white;
            padding: 25px;
            border-radius: 10px;
            border: 2px dashed #e5e7eb;
            text-align: center;
            margin: 25px 0;
            font-family: 'Courier New', monospace;
        }
        .new-password {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #111827;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 8px;
            margin: 15px 0;
        }
        .details-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #8b5cf6;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            margin: 12px 0;
            padding-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
        }
        .detail-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 140px;
        }
        .detail-value {
            color: #111827;
        }
        .login-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 25px 0;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
        }
        .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 18px;
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        @media (max-width: 600px) {
            body {
                padding: 15px;
            }
            .content {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">QuantumChem</div>
        <div style="color: #f59e0b; font-size: 14px; margin-top: 5px;">Password Reset Request</div>
    </div>
    
    <div class="content">
        <h2 style="color: #111827; margin-top: 0;">Your Password Has Been Reset</h2>
        <p>Hello <strong>${user.name}</strong>, as requested, here is your new temporary password:</p>
        
        <div class="password-display">
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">New Temporary Password</div>
            <div class="new-password">${newPassword}</div>
            <div style="color: #6b7280; font-size: 13px; margin-top: 10px;">
                Valid for ${PASSWORD_VALID_DAYS} days
            </div>
        </div>
        
        <div class="details-box">
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${user.name}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${user.email}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Valid Until:</div>
                <div class="detail-value">${user.passwordExpiresAt.toLocaleDateString()}</div>
            </div>
        </div>
        
        <a href="${FRONTEND_URL}/login.html" class="login-button">Login with New Password</a>
        
        <div class="warning-box">
            <div style="color: #92400e; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Important Security Notice</div>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                • If you didn't request this password reset, please contact support immediately<br>
                • This password will expire in ${PASSWORD_VALID_DAYS} days<br>
                • Never share your password with anyone
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2026 QuantumChem Research Platform</p>
        <p>For security questions, contact <a href="mailto:quantumchem25@gmail.com" style="color: #2563eb;">quantumchem25@gmail.com</a></p>
    </div>
</body>
</html>`,
      text: plainText
    });

    res.json({
      message: "If the email is registered, a new password has been sent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};