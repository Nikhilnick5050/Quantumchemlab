const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const user = await User.findOneAndUpdate(
      { email: payload.email },
      {
        name: payload.name,
        picture: payload.picture,
        lastLogin: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

module.exports = router;
router.get("/google/callback", (req, res) => {
  res.send("Google OAuth callback OK");
});