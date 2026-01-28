// Load environment FIRST
import "dotenv/config";

// Imports
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database
import connectDB from "./config/db.js";

// Routes
import manualAuthRoutes from "./api/routes/manualAuth.routes.js";
import googleAuthRoutes from "./api/routes/googleAuth.routes.js";
import userRoutes from "./api/routes/user.routes.js";

// =======================
// AUTO-CONFIGURE FOR RAILWAY
// =======================
console.log("🔧 Configuring environment...");

// Detect platform
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_STATIC_URL;
const isVercel = process.env.VERCEL === '1';
const PORT = process.env.PORT || 3000;

console.log("Port:", PORT);
console.log("RAILWAY_STATIC_URL:", process.env.RAILWAY_STATIC_URL);
console.log("VERCEL:", process.env.VERCEL);

// Auto-set URLs based on platform
if (isVercel) {
  process.env.FRONTEND_URL = 'https://www.quantumchem.site';
  process.env.GOOGLE_CALLBACK_URL = 'https://quantumchem.vercel.app/api/auth/google/callback';
  process.env.NODE_ENV = 'production';
  console.log("🌐 Platform: Vercel");
} else if (isRailway) {
  // Railway specific
  const railwayUrl = process.env.RAILWAY_STATIC_URL || 'https://quantumchemlab-production.up.railway.app';
  process.env.FRONTEND_URL = 'https://www.quantumchem.site';
  process.env.GOOGLE_CALLBACK_URL = `${railwayUrl}/api/auth/google/callback`;
  process.env.NODE_ENV = 'production';
  console.log("🌐 Platform: Railway");
  console.log("Railway URL:", railwayUrl);
} else {
  // Localhost
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  process.env.GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  console.log("🌐 Platform: Localhost");
}

// Log final configuration
console.log("✅ Final Configuration:");
console.log("- FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("- GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", PORT);

// =======================
// APP INIT
// =======================
const app = express();

// CORS - Allow all origins for now
app.use(cors({
  origin: "*", // Allow all for testing
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

// Connect DB
connectDB();

// Routes
app.use("/api/auth", manualAuthRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    service: "QuantumChem API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL
  });
});

// Debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "NOT SET",
    frontendUrl: process.env.FRONTEND_URL || "NOT SET",
    nodeEnv: process.env.NODE_ENV || "development",
    port: PORT,
    timestamp: new Date().toISOString(),
    railwayUrl: process.env.RAILWAY_STATIC_URL,
    vercel: process.env.VERCEL
  });
});

// Fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Google Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Static files from: ${path.join(__dirname, "public")}`);
  console.log("=".repeat(50));
});