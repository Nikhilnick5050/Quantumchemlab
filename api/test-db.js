import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    await client.db("quantumchem").command({ ping: 1 });

    res.status(200).json({
      ok: true,
      message: "MongoDB connected successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}