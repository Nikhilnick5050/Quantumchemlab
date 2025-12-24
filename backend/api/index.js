require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("../routes/auth");

const app = express();

/* MIDDLEWARE */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quantumchem.site",
    ],
    credentials: true,
  })
);

/* HEALTH CHECK */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "API working on Vercel" });
});

/* ROUTES */
app.use("/api/auth", authRoutes);

/* DATABASE (safe for serverless) */
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));
}

/* EXPORT (CRITICAL) */
module.exports = app;