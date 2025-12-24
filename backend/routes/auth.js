const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ---------- GOOGLE LOGIN ---------- */
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const user = await User.findOneAndUpdate(
      { email: payload.email },
      {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: "google",
      },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google login failed" });
  }
});

/* ---------- MANUAL REGISTER ---------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { name, email, provider: "local" },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Registration failed" });
  }
});

module.exports = router;