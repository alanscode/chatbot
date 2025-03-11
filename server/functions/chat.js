require('dotenv').config();
const fs = require('fs');
const path = require('path');
const utils = require('../utils/chat-utils');

// Load resume data
const { systemPrompt, resumeContent } = utils.loadResumeData();

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = utils.getCorsHeaders();

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

    // Clean and validate messages
    const result = utils.cleanMessages(messages);
    
    if (!result.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: result.error }),
      };
    }

    const cleanedMessages = result.cleanedMessages;

    // Add system prompt and resume content to the messages
    const messagesWithSystemPrompt = [
      ...cleanedMessages
    ];

    // Combine system prompt and resume content for the top-level system parameter
    const systemContent = systemPrompt + '\n\n-- RESUME START --\n' + resumeContent;

    // For non-streaming requests, use the regular API
    const response = await utils.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: messagesWithSystemPrompt,
      system: systemContent,
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