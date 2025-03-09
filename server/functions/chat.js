require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { messages } = requestBody;

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request. Messages array is required.' }),
      };
    }

    // Helper function to safely check if content is non-empty
    const hasNonEmptyContent = (content) => {
      if (content === undefined || content === null) return false;
      if (typeof content === 'string') return content.trim() !== '';
      return true; // If it's an object or array, consider it non-empty
    };

    // Clean the messages to remove any fields not accepted by Anthropic
    // AND filter out messages with empty content (except possibly the last assistant message)
    const cleanedMessages = messages
      .filter((message, index) => {
        // Keep messages with non-empty content
        if (hasNonEmptyContent(message.content)) {
          return true;
        }
        // Allow empty content only for the last message if it's from the assistant
        return index === messages.length - 1 && message.role === 'assistant';
      })
      .map(message => {
        // Ensure content is a string
        let safeContent = '';
        if (typeof message.content === 'string') {
          safeContent = message.content;
        } else if (message.content !== undefined && message.content !== null) {
          // If content is an object or array, convert to string
          try {
            safeContent = JSON.stringify(message.content);
          } catch (e) {
            console.warn('Failed to stringify content:', e);
            safeContent = String(message.content);
          }
        }
        
        return {
          role: message.role,
          content: safeContent
        };
      });

    // Log the cleaned messages for debugging
    console.log('Cleaned messages:', JSON.stringify(cleanedMessages, null, 2));

    // Ensure we have at least one message
    if (cleanedMessages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request. At least one message with content is required.' }),
      };
    }

    // For non-streaming requests, use the regular API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: cleanedMessages,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error details:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      }),
    };
  }
}; 