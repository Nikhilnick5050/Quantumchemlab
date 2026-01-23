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

    // 🔴 PASTE HERE 👇
    const userMessage = message.toLowerCase();

    if (userMessage.includes("who owns you") || userMessage.includes("who runs you")) {
      return res.status(200).json({
        reply: "I am developed and managed by **Nikhil Shinde**, founder of QuantumChem – Advanced Chemical Database."
      });
    }

    if (userMessage.includes("who developed you") || userMessage.includes("developer")) {
      return res.status(200).json({
        reply: "This AI assistant was developed by **Nikhil Shinde**, as part of the QuantumChem Laboratory Database project at PCCOE, Pune."
      });
    }

    if (userMessage.includes("what is quantumchem")) {
      return res.status(200).json({
        reply: "**QuantumChem** is an advanced chemical research and laboratory database platform designed for students, researchers, and academic institutions. It provides chemical data, research support, and safety information."
      });
    }

    if (userMessage.includes("contact") || userMessage.includes("contact details")) {
      return res.status(200).json({
        reply: `
📧 **Email:** quantumchem25@gmail.com  
📞 **Phone:** +91 81492 77038  
📍 **Location:** PCCOE, Pune  
🕒 **Office Hours:** Mon–Fri, 9AM–6PM IST
        `
      });
    }

    if (userMessage.includes("database")) {
      return res.status(200).json({
        reply: `
🔬 **QuantumChem Database Access**

• Chemical compound information  
• Safety and research data  
• Academic & laboratory support  
• Research collaboration  

Access is available for students and researchers.
        `
      });
    }
    // 🔴 END HERE 👆

    // If no custom answer → OpenAI responds
    const systemPrompt = `
You are QuantumChem AI Assistant.
Owned and developed by Nikhil Shinde.
Never mention OpenAI or ChatGPT.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    res.status(200).json({
      reply: response.output_text,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI error" });
  }
}
