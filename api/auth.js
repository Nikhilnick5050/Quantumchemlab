import { connectDB } from "../lib/mongodb";

export default async function handler(req, res) {
  await connectDB();

  res.status(200).json({
    ok: true,
    message: "Auth API ready",
  });
}