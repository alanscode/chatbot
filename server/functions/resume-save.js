const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

exports.handler = async (event, context) => {
  // Always allow the specific origin
  const allowedOrigin = 'https://alans-resume.netlify.app';
  
  // Set CORS headers explicitly for the allowed origin
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const resumePath = path.join(__dirname, '../data/alan_nguyen_resume.md');

  try {
    const requestBody = JSON.parse(event.body);
    const { content } = requestBody;
    
    if (!content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request',
          message: 'Content is required'
        })
      };
    }

    await fs.writeFile(resumePath, content, 'utf8');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Resume saved successfully' })
    };
  } catch (error) {
    console.error('Error saving resume:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred'
      })
    };
  }
}; 