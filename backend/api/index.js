require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("../routes/auth");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quantumchem.site"
    ],
    credentials: true,
  })
);

/* ===============================
   HEALTH CHECK (TEST API)
================================ */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working 🚀"
  });
});

/* ===============================
   AUTH ROUTES
================================ */
app.use("/api/auth", authRoutes);

/* ===============================
   DATABASE CONNECTION
   (Vercel-safe: connect once)
================================ */
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));
}

/* ===============================
   EXPORT APP FOR VERCEL
   ❌ NO app.listen()
================================ */
module.exports = app;