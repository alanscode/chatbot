const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

exports.handler = async (event, context) => {
  // Get the origin from the request headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Set CORS headers to allow requests from the specific origin
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  const resumePath = path.join(__dirname, '../data/alan_nguyen_resume.md');

  try {
    if (event.httpMethod === 'GET') {
      const content = await fs.readFile(resumePath, 'utf8');
      return {
        statusCode: 200,
        headers,
        body: content.trim()
      };
    } else if (event.httpMethod === 'POST' && event.path.endsWith('/save')) {
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
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error handling resume request:', error);
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