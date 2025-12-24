require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

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

/* STATIC FILES */
app.use(express.static(path.join(__dirname, "../../public")));

/* ROOT */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

/* HEALTH */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ROUTES */
app.use("/api/auth", authRoutes);

/* DB */
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(console.error);
}

/* 🔴 REQUIRED FOR VERCEL */
module.exports = (req, res) => {
  app(req, res);
};