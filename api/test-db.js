export const config = {
  runtime: "nodejs",
};

import clientPromise from "../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("quantumchem");

    res.status(200).json({
      ok: true,
      message: "MongoDB connected successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}