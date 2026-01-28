import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 🔐 hashed temporary password
    password: {
      type: String,
      default: null,
    },

    // ⏳ password expiry (4 days)
    passwordExpiresAt: {
      type: Date,
      default: null,
    },

    // auth type
    authProvider: {
      type: String,
      enum: ["manual", "google"],
      required: true,
    },

    // ✅ IMPORTANT FIX
    // Only exists for Google users
    googleId: {
      type: String,
      unique: true,
      sparse: true, // ⭐ THIS FIXES YOUR ERROR
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
