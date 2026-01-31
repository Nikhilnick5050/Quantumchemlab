import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";

import manualAuthRoutes from "./routes/manualAuth.routes.js";
import googleAuthRoutes from "./routes/googleAuth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js"; // Already imported!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: ["http://localhost:3000", "https://www.quantumchem.site", "https://quantumchem.site"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- STATIC ---------- */
app.use(express.static(path.join(__dirname, "../public")));

/* ---------- DB ---------- */
connectDB();

/* ---------- ROUTES ---------- */
app.use("/api/auth", manualAuthRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes); // Already registered!

/* ---------- HEALTH ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", env: process.env.NODE_ENV || "development" });
});

/* ---------- FALLBACK ---------- */
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API not found" });
  }
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

export default app;