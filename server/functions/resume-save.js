const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Set CORS headers to allow requests from any origin
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
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