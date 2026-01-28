import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../services/brevo.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // UPDATED: Add FRONTEND_URL environment variable
const PASSWORD_VALID_DAYS = 4;

// =======================
// Generate readable temp password
// =======================
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

// =======================
// REGISTER (MANUAL)
// name + email ONLY
// =======================
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
      password: null,               // ✅ NO PASSWORD YET
      authProvider: "manual",
      isEmailVerified: false,
      verificationToken,
    });

    // UPDATED: Use FRONTEND_URL environment variable
    const verifyLink = `${FRONTEND_URL}/api/auth/verify/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your QuantumChem account",
      html: `
        <h2>Welcome to QuantumChem 🚀</h2>
        <p>Please verify your email to receive your login password.</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `,
    });

    res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// =======================
// VERIFY EMAIL
// Generates TEMP PASSWORD
// =======================
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

    await sendEmail({
      to: user.email,
      subject: "Your QuantumChem Login Password 🔐",
      html: `
        <h3>Hello ${user.name},</h3>
        <p>Your temporary login password is:</p>
        <h2>${tempPassword}</h2>
        <p>This password is valid for <b>4 days</b>.</p>
        <p>You can reset it anytime from the login page.</p>
      `,
    });

    res.send("Email verified. Password sent to your email.");
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).send("Verification failed");
  }
};

// =======================
// LOGIN (MANUAL)
// =======================
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

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// =======================
// RESET PASSWORD (ALWAYS AVAILABLE)
// =======================
export const resetPasswordManual = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, authProvider: "manual" });
    if (!user || !user.isEmailVerified) {
      return res.json({
        message:
          "If the email exists, password reset instructions have been sent.",
      });
    }

    const newPassword = generateTempPassword();
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordExpiresAt = new Date(
      Date.now() + PASSWORD_VALID_DAYS * 24 * 60 * 60 * 1000
    );

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your New QuantumChem Password 🔐",
      html: `
        <h3>Password Reset</h3>
        <p>Your new temporary password:</p>
        <h2>${newPassword}</h2>
        <p>Valid for 4 days.</p>
      `,
    });

    res.json({
      message: "If the email exists, a new password has been sent.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};