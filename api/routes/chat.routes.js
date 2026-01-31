// api/routes/chat.routes.js
import express from 'express';
import { getChatReply } from '../services/chat.js';

const router = express.Router();

/**
 * POST / - Send a message to the chat assistant
 * @body {Object} - Request body
 * @body {string} message - The message to send to the assistant
 * @returns {Object} - JSON response with the assistant's reply
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    // Validate that message exists
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    // Get the assistant's reply
    const reply = await getChatReply(message);

    // Return the reply as JSON
    res.json({ reply });
    
  } catch (error) {
    console.error('Error in chat route:', error);
    
    // Send appropriate error response
    res.status(500).json({
      error: 'Failed to process chat request',
      message: error.message
    });
  }
});

export default router;