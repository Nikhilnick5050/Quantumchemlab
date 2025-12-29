import { streamText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { message } = req.body;

  const result = await streamText({
    model: 'openai/gpt-5',
    prompt: message,
  });

  const response = await result.text;
  res.status(200).json({ reply: response });
}
