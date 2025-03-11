const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

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

  const dataDir = path.join(__dirname, '../data');
  const resumePath = path.join(dataDir, 'alan_nguyen_resume.md');

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

    console.log('Data directory:', dataDir);
    console.log('Resume path:', resumePath);
    
    // Ensure data directory exists
    if (!fsSync.existsSync(dataDir)) {
      console.log('Data directory does not exist, creating it...');
      await fs.mkdir(dataDir, { recursive: true });
      console.log('Data directory created');
    }
    
    console.log('Attempting to write file...');
    await fs.writeFile(resumePath, content, 'utf8');
    console.log('File written successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Resume saved successfully' })
    };
  } catch (error) {
    console.error('Error saving resume:', error);
    console.error('Error details:', JSON.stringify({
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    }));
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error',
        message: error.message || 'An unexpected error occurred',
        code: error.code
      })
    };
  }
}; 