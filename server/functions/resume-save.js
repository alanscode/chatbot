const fs = require('fs').promises;
const path = require('path');

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

    // Use dynamic import for the netlify package
    const { NetlifyAPI } = await import('netlify');

    // Store content in environment variable using Netlify API
    if (process.env.NETLIFY_API_TOKEN) {
      const client = new NetlifyAPI(process.env.NETLIFY_API_TOKEN);
      const siteId = process.env.SITE_ID;
      
      if (siteId) {
        await client.updateSiteEnvVars({
          siteId,
          body: {
            RESUME_CONTENT: content
          }
        });
        console.log('Content stored in environment variable successfully');
      } else {
        console.error('SITE_ID environment variable not set');
      }
    } else {
      console.error('NETLIFY_API_TOKEN environment variable not set');
    }

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
        message: error.message || 'An unexpected error occurred'
      })
    };
  }
}; 