// 🔥 Load environment FIRST
import "dotenv/config";

// =======================
// IMPORTS
// =======================
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// =======================
// GET __dirname FOR ES MODULES
// =======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// DATABASE
// =======================
import connectDB from "./config/db.js";

// =======================
// ROUTES
// =======================
import manualAuthRoutes from "./api/routes/manualAuth.routes.js";
import googleAuthRoutes from "./api/routes/googleAuth.routes.js";
import userRoutes from "./api/routes/user.routes.js";

// =======================
// AUTO-SET ENVIRONMENT URLs
// =======================
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_STATIC_URL;
const isVercel = process.env.VERCEL === '1';

// Set NODE_ENV if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = isRailway || isVercel ? 'production' : 'development';
}

// Set FRONTEND_URL
if (!process.env.FRONTEND_URL) {
  if (isVercel) {
    process.env.FRONTEND_URL = 'https://www.quantumchem.site';
  } else if (isRailway) {
    process.env.FRONTEND_URL = 'https://www.quantumchem.site';
  } else {
    process.env.FRONTEND_URL = 'http://localhost:3000';
  }
}

// Set GOOGLE_CALLBACK_URL
if (!process.env.GOOGLE_CALLBACK_URL) {
  if (isVercel) {
    process.env.GOOGLE_CALLBACK_URL = 'https://quantumchem.vercel.app/api/auth/google/callback';
  } else if (isRailway) {
    process.env.GOOGLE_CALLBACK_URL = 'https://quantumchemlab-production.up.railway.app/api/auth/google/callback';
  } else {
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/auth/google/callback';
  }
}

// =======================
// APP INIT
// =======================
const app = express();

// =======================
// MIDDLEWARES
// =======================
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "https://localhost:3000",
    "https://www.quantumchem.site",
    "https://quantumchem.site",
    "https://quantumchem.vercel.app",
    "https://quantumchemlab-production.up.railway.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// =======================
// CONNECT DB
// =======================
connectDB();

// =======================
// ROUTES
// =======================
app.use("/api/auth", manualAuthRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/user", userRoutes);

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Google Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV}`);
  console.log("=".repeat(50));
});