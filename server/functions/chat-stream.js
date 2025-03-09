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

    // Clean the messages to remove any fields not accepted by Anthropic
    // AND filter out messages with empty content (except possibly the last assistant message)
    const cleanedMessages = messages
      .filter((message, index) => {
        // Keep messages with non-empty content
        if (message.content && message.content.trim() !== '') {
          return true;
        }
        // Allow empty content only for the last message if it's from the assistant
        return index === messages.length - 1 && message.role === 'assistant';
      })
      .map(message => ({
        role: message.role,
        content: message.content || ''
      }));

    // Ensure we have at least one message
    if (cleanedMessages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request. At least one message with content is required.' }),
      };
    }

    // For Netlify functions, we can't do true streaming
    // So we'll get the complete response and return it
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: cleanedMessages,
    });

    // Return the complete response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response.content[0].text }),
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