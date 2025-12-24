import clientPromise from "../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    res.status(200).json({
      ok: true,
      db: db.databaseName,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}