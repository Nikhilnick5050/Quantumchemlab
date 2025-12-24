import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI not found in environment variables");
  }

  await mongoose.connect(uri, {
    dbName: "quantumchemlab",
  });

  isConnected = true;
}