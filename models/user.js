import clientPromise from "../lib/mongodb";

export async function getUserCollection() {
  const client = await clientPromise;
  const db = client.db("quantumchem");
  return db.collection("users");
}