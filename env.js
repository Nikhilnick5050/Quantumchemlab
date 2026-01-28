import dotenv from "dotenv";

dotenv.config();

console.log("✅ ENV loaded");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "MISSING");
console.log("BREVO HOST:", process.env.BREVO_SMTP_HOST || "MISSING");
