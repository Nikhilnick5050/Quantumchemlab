// 🔥 ENV MUST LOAD FIRST (DO NOT MOVE)
import "./env.js";

// =======================
// IMPORTS
// =======================
import express from "express";
import cors from "cors";
import OpenAI from "openai";
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
// APP INIT
// =======================
const app = express();

// =======================
// MIDDLEWARES
// =======================
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "https://www.quantumchem.site",
    "https://quantumchem.vercel.app",
    /.+\.quantumchem\.site$/,
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // ✅ CHANGED TO "public"

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
// OPENAI (OPTIONAL)
// =======================
if (process.env.OPENAI_API_KEY) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: message,
      });

      res.json({ reply: response.output_text });
    } catch (err) {
      console.error("OPENAI ERROR:", err.message);
      res.status(500).json({ reply: "AI error" });
    }
  });
}

// =======================
// FALLBACK ROUTING
// =======================
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html")); // ✅ CHANGED TO "public"
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});