const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');

exports.handler = async (event, context) => {
  // Set CORS headers to allow requests from any origin
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Use path.resolve to get an absolute path that works in Netlify Functions
  const dataDir = path.resolve(process.env.LAMBDA_TASK_ROOT || __dirname, '../data');
  const resumePath = path.join(dataDir, 'alan_nguyen_resume.md');

  try {
    if (event.httpMethod === 'GET') {
      let content;
      
      try {
        // First try to read from file
        if (fsSync.existsSync(resumePath)) {
          content = await fs.readFile(resumePath, 'utf8');
          console.log('Resume content read from file successfully');
        } else {
          // Try alternative location
          const altDataDir = path.join(process.cwd(), 'data');
          const altResumePath = path.join(altDataDir, 'alan_nguyen_resume.md');
          
          if (fsSync.existsSync(altResumePath)) {
            content = await fs.readFile(altResumePath, 'utf8');
            console.log('Resume content read from alternative location successfully');
          } else {
            // If file doesn't exist, check environment variable
            if (process.env.RESUME_CONTENT) {
              content = process.env.RESUME_CONTENT;
              console.log('Resume content read from environment variable');
            } else {
              // Default content if nothing else is available
              content = "# Alan Nguyen's Resume\n\nThis is a placeholder resume. Please edit and save to update.";
              console.log('Using default resume content');
            }
          }
        }
      } catch (readError) {
        console.error('Error reading resume file:', readError);
        // Fallback to environment variable or default content
        if (process.env.RESUME_CONTENT) {
          content = process.env.RESUME_CONTENT;
          console.log('Resume content read from environment variable after file read error');
        } else {
          content = "# Alan Nguyen's Resume\n\nThis is a placeholder resume. Please edit and save to update.";
          console.log('Using default resume content after file read error');
        }
      }
      
      return {
        statusCode: 200,
        headers,
        body: content.trim()
      };
    } else if (event.httpMethod === 'POST' && event.path.endsWith('/save')) {
      // POST requests are handled by resume-save.js
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed', message: 'Use /api/resume/save endpoint for saving' })
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
        message: error.message || 'An unexpected error occurred'
      })
    };
  }
}; 