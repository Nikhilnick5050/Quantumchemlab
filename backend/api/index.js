require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

/* ---------- MIDDLEWARE ---------- */
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

/* ---------- HEALTH CHECK ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "API working" });
});

/* ---------- AUTH ROUTES ---------- */
app.use("/api/auth", authRoutes);

/* ---------- DATABASE ---------- */
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));
}

/* ---------- EXPORT FOR VERCEL ---------- */
module.exports = app;