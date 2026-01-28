
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

    // 🔴 CUSTOM RESPONSES START 👇
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

    if (userMessage.includes("what is quantumchem") || userMessage.includes("quantumchem")) {
      return res.status(200).json({
        reply: "**QuantumChem** is an advanced chemical research and laboratory database platform designed for students, researchers, and academic institutions. It provides chemical data, research support, and safety information."
      });
    }

    if (userMessage.includes("contact") || userMessage.includes("contact details") || userMessage.includes("email")) {
      return res.status(200).json({
        reply: `📧 **Email:** quantumchem25@gmail.com  
📞 **Phone:** +91 81492 77038  
📍 **Location:** PCCOE, Pune  
🕒 **Office Hours:** Mon–Fri, 9AM–6PM IST`
      });
    }

    if (userMessage.includes("database")) {
      return res.status(200).json({
        reply: `🔬 **QuantumChem Database Access**

• Chemical compound information  
• Safety and research data  
• Academic & laboratory support  
• Research collaboration  

Access is available for students and researchers.`
      });
    }

    if (userMessage.includes("nikhil") || userMessage.includes("shinde")) {
      return res.status(200).json({
        reply: `**Nikhil Subhash Shinde** is an 18-year-old Computer Engineering student at Pimpri Chinchwad College of Engineering (PCCoE), Pune. He is the founder and developer of QuantumChem and this AI assistant.

**Education:**
• B.Tech Computer Engineering, PCCoE Pune (2025-2029)
• HSC, Dahanukar Vidyalaya (79.33%)
• SSC, Dahanukar English Medium School (83%)

**Contact:**
• Email: nikhilsubsun123@gmail.com, nikhilsubsun321@gmail.com
• Phone: Available upon request
• Location: Pune, India

**Social Media:**
• Instagram: @nikhilnick5046
• LinkedIn: Nikhil Shinde
• Facebook: Nikhil Nick
• X/Twitter: @Nikhilnick5046
• Portfolio: nikhilshindeportfolio.vercel.app`
      });
    }

    if (userMessage.includes("education") || userMessage.includes("college") || userMessage.includes("pccoe")) {
      return res.status(200).json({
        reply: `**Nikhil Shinde's Education:**

🎓 **Pimpri Chinchwad College of Engineering (PCCoE), Pune**
• Degree: Bachelor of Technology (B.Tech) in Computer Engineering
• University: Savitribai Phule Pune University (SPPU)
• Duration: September 2025 – June 2029

🏫 **Dahanukar Vidyalaya Science & Commerce Junior College**
• Qualification: HSC (Higher Secondary Certificate)
• Grade: 79.33%
• Duration: June 2023 – February 2025

🏫 **Dahanukar English Medium School**
• Qualification: SSC (Secondary School Certificate)
• Grade: 83%
• Duration: June 2021 – March 2023`
      });
    }

    if (userMessage.includes("portfolio") || userMessage.includes("website")) {
      return res.status(200).json({
        reply: `🌐 **Nikhil Shinde's Portfolio:** https://nikhilshindeportfolio.vercel.app/

**Social Media Links:**
• Instagram: https://www.instagram.com/nikhilnick5046
• LinkedIn: https://www.linkedin.com/in/nikhil-shinde-286937367
• Facebook: https://www.facebook.com/nikhil.nick.392111
• X/Twitter: https://x.com/Nikhilnick5046

**Project Images:**
• https://i.pinimg.com/736x/45/6a/2b/456a2b69a0d9e757b9053ea7d337c500.jpg
• https://i.pinimg.com/736x/08/c3/76/08c37667eb7362e881a4f5868ace8b1d.jpg`
      });
    }

    if (userMessage.includes("social media") || userMessage.includes("instagram") || userMessage.includes("linkedin") || userMessage.includes("facebook") || userMessage.includes("twitter")) {
      return res.status(200).json({
        reply: `📱 **Nikhil Shinde's Social Media:**

• Instagram: https://www.instagram.com/nikhilnick5046
• LinkedIn: https://www.linkedin.com/in/nikhil-shinde-286937367
• Facebook: https://www.facebook.com/nikhil.nick.392111
• X/Twitter: https://x.com/Nikhilnick5046
• Portfolio: https://nikhilshindeportfolio.vercel.app/`
      });
    }

    if (userMessage.includes("age") || userMessage.includes("old")) {
      return res.status(200).json({
        reply: "Nikhil Shinde is 18 years old."
      });
    }

    if (userMessage.includes("computer engineering") || userMessage.includes("why computer")) {
      return res.status(200).json({
        reply: `Nikhil chose Computer Engineering because of its vast scope, dynamic nature, and direct impact on shaping the future. From an early age, he has been interested in understanding how software is built and how technology connects people.

His passion lies in exploring programming, artificial intelligence, and advanced computing systems. He believes computer engineering is not just about coding, but also about creating tools that simplify life and bring positive change.`
      });
    }
    // 🔴 CUSTOM RESPONSES END 👆

    // If no custom answer → OpenAI responds
    const systemPrompt = `
You are QuantumChem AI Assistant, developed and owned by Nikhil Subhash Shinde.

**About Nikhil Shinde:**
- 18-year-old Computer Engineering student at Pimpri Chinchwad College of Engineering (PCCoE), Pune
- Founder and developer of QuantumChem - Advanced Chemical Database
- Education: B.Tech Computer Engineering (2025-2029), HSC 79.33%, SSC 83%
- Email: nikhilsubsun123@gmail.com, nikhilsubsun321@gmail.com
- Location: Pune, India
- Social: Instagram @nikhilnick5046, LinkedIn, Facebook, X/Twitter @Nikhilnick5046
- Portfolio: https://nikhilshindeportfolio.vercel.app/

**About QuantumChem:**
Advanced chemical research and laboratory database platform for students, researchers, and academic institutions.

**Important Instructions:**
1. NEVER mention OpenAI or ChatGPT in your responses
2. Always identify as "QuantumChem AI Assistant"
3. When asked about development/ownership, mention Nikhil Shinde
4. Keep responses professional, helpful, and concise
5. If you don't know something, say you're still learning
6. Be enthusiastic about helping with chemical research and academic queries
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