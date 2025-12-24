require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

/* 🔥 REQUIRED */
app.use(express.json());

/* 🔥 CORS */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://quantumchem.site"
  ]
}));

/* 🔥 DATABASE */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

/* 🔥 TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

/* 🔥 AUTH ROUTES */
app.use("/auth", authRoutes);

/* 🔥 SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
