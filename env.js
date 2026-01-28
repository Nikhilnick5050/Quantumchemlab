import dotenv from "dotenv";

dotenv.config();

console.log("✅ ENV loaded");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "MISSING");
console.log("BREVO HOST:", process.env.BREVO_SMTP_HOST || "MISSING");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET (first 10 chars)" : "MISSING");
console.log("GOOGLE_CALLBACK_URL_PROD:", process.env.GOOGLE_CALLBACK_URL_PROD || "MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV || "MISSING");
console.log("VERCEL:", process.env.VERCEL || "FALSE");