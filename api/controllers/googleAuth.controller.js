import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../services/brevo.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // UPDATED: Use environment variable

export const googleCallback = async (req, res) => {
  try {
    const { email, name, sub } = req.user;

    let user = await User.findOne({ email });

    // ✅ CREATE user if not exists
    if (!user) {
      user = new User({
        name,
        email,
        authProvider: "google",
        googleId: sub,
        isEmailVerified: true,
      });
    }

    // ✅ FORCE authProvider (fix for old users)
    if (!user.authProvider) {
      user.authProvider = "google";
    }

    // ✅ Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // ✅ Send welcome email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to QuantumChem 🚀",
        html: `
          <h2>Welcome ${user.name}!</h2>
          <p>You logged in using <b>Google</b>.</p>
          <p>Last login: ${user.lastLoginAt.toLocaleString()}</p>
        `,
      });
    } catch (e) {
      console.error("Email failed:", e.message);
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ ABSOLUTE redirect - UPDATED: Use FRONTEND_URL environment variable
    res.redirect(
      `${FRONTEND_URL}/profile.html?token=${token}`
    );

  } catch (error) {
    console.error("Google callback error:", error);
    // UPDATED: Use FRONTEND_URL environment variable for error redirect too
    res.redirect(`${FRONTEND_URL}/login.html`);
  }
};