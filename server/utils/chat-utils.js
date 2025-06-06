require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to safely check if content is non-empty
const hasNonEmptyContent = (content) => {
  if (content === undefined || content === null) return false;
  if (typeof content === 'string') return content.trim() !== '';
  return true; // If it's an object or array, consider it non-empty
};

// Load resume and system prompt
const loadResumeData = () => {
  let systemPrompt = '';
  let resumeContent = '';

  try {
    // Read from file system
    const resumePath = path.join(__dirname, '../data/alan_nguyen_resume.md');
    const fileContent = fs.readFileSync(resumePath, 'utf8');
    
    // Extract system prompt (content between ## SYSTEM_PROMPT and ## RESUME_CONTENT_START)
    const systemPromptMatch = fileContent.match(/## SYSTEM_PROMPT\s+([\s\S]*?)## RESUME_CONTENT_START/);
    systemPrompt = systemPromptMatch ? systemPromptMatch[1].trim() : '';
    
    // Extract resume content (everything after ## RESUME_CONTENT_START)
    const resumeContentMatch = fileContent.match(/## RESUME_CONTENT_START\s+([\s\S]*)/);
    resumeContent = resumeContentMatch ? resumeContentMatch[1].trim() : fileContent;
    
    console.log('Successfully loaded system prompt and resume content from file');
  } catch (error) {
    console.error('Error reading resume file:', error);
    // Set to empty strings if there's an error
    systemPrompt = '';
    resumeContent = '';
  }

  return { systemPrompt, resumeContent };
};

// Get CORS headers
const getCorsHeaders = () => {
  return {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
};

// Clean and validate messages
const cleanMessages = (messages) => {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'Invalid request. Messages array is required.' };
  }

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
      valid: false, 
      error: 'Invalid request. At least one message with content is required.' 
    };
  }

  return { valid: true, cleanedMessages };
};

module.exports = {
  anthropic,
  hasNonEmptyContent,
  loadResumeData,
  getCorsHeaders,
  cleanMessages
};