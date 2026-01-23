import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
console.log("ENV KEY =", process.env.OPENAI_API_KEY);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Start server FIRST
app.listen(3000, () => {
  console.log("🔥 Server running at http://localhost:3000");
});

// OpenAI client AFTER server start
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error("OPENAI ERROR:", error.message);
    res.status(500).json({ reply: "AI error" });
  }
});
