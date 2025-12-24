require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ FIX 1

const authRoutes = require("./auth"); // ✅ FIX 2 (path inside api folder)

const app = express();

/* ---------- MIDDLEWARE ---------- */
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

/* ---------- HEALTH CHECK ---------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "API running" });
});

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ---------- EXPORT (NO LISTEN) ---------- */
module.exports = app;