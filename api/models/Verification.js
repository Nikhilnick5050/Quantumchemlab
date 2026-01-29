// models/Verification.js
import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  verificationToken: {
    type: String,
    required: true,
    unique: true
  },
  resendCount: {
    type: Number,
    default: 0,
    max: 5
  },
  lastResentAt: Date,
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 86400 } // 24 hours TTL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Verification", verificationSchema);