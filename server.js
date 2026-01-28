// 🔥 ENV MUST LOAD FIRST (DO NOT MOVE)
import "./env.js";

// =======================
// IMPORTS
// =======================
import express from "express";
import cors from "cors";
import OpenAI from "openai";

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
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
