// api/services/chat.js
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get a chat reply from OpenAI's chat model
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The assistant's text reply
 */
export async function getChatReply(message) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can change this to gpt-4 or other models
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Extract and return only the assistant's text reply
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error getting chat reply:', error);
    throw new Error('Failed to get chat reply');
  }
}