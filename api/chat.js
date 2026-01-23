import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { message } = req.body;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    res.status(200).json({
      reply: response.output_text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI error" });
  }
}
