const Anthropic = require('@anthropic-ai/sdk');
const anthropicService = require('../services/anthropicService');
const loggingService = require('../services/loggingService');
const fs = require('fs');
const path = require('path');

// Cache for resume content
let resumeCache = null;

// Function to load resume content
const loadResumeContent = () => {
  if (resumeCache) return resumeCache;
  
  try {
    const resumePath = path.join(__dirname, '../data/alan_nguyen_resume.md');
    resumeCache = fs.readFileSync(resumePath, 'utf8');
    return resumeCache;
  } catch (error) {
    console.error('Error loading resume file:', error);
    return 'Resume information unavailable';
  }
};

// Regular message endpoint
exports.sendMessage = async (req, res) => {
  try {
    const { messages, options } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    // Add resume information to all messages
    messages.unshift({
      role: 'system',
      content: 'Here is the user\'s resume information: ' + loadResumeContent()
    });
    
    const response = await anthropicService.sendMessage(messages, options);
    
    // Extract the last user message as the question
    const userQuestion = messages.filter(msg => msg.role === 'user').pop()?.content || '';
    
    // Log the interaction
    await loggingService.logChatInteraction(userQuestion, response.content);
    
    return res.json(response);
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    return res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
};

// Streaming message endpoint
exports.streamMessage = async (req, res) => {
  let headersSent = false;
  let finalAssistantResponse = '';
  
  try {
    const { messages, options } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Add resume information to all messages
    messages.unshift({
      role: 'system',
      content: 'Here is the user\'s resume information: ' + loadResumeContent()
    });

    // Extract the last user message as the question
    const userQuestion = messages.filter(msg => msg.role === 'user').pop()?.content || '';

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain'); // Changed back to text/plain for better streaming
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
    
    // Flush headers immediately
    if (res.flush) {
      res.flush();
    }
    headersSent = true;
    
    console.log('Starting stream response');
    
    // Stream the response from Anthropic
    await anthropicService.streamMessage(messages, options, (chunk) => {
      try {
        // Send each chunk as a separate JSON object
        const chunkData = JSON.stringify(chunk);
        res.write(chunkData + '\n');
        
        // Flush after each chunk to ensure immediate delivery
        if (res.flush) {
          res.flush();
        }
        
        // If this is the final chunk, save the complete response for logging
        if (chunk.isFinal) {
          finalAssistantResponse = chunk.content;
          
          // Log the interaction
          loggingService.logChatInteraction(userQuestion, finalAssistantResponse)
            .catch(err => console.error('Error logging chat interaction:', err));
        }
        
        console.log('Sending chunk:', JSON.stringify({
          role: chunk.role,
          content: chunk.content ? chunk.content.substring(0, 30) + (chunk.content.length > 30 ? '...' : '') : '',
          isPartial: chunk.isPartial,
          isFinal: chunk.isFinal,
          chunkId: chunk.chunkId
        }));
      } catch (err) {
        console.error('Error sending chunk:', err);
      }
    });
    
    console.log('Stream completed');
    res.end();
  } catch (error) {
    console.error('Error in streamMessage controller:', error);
    
    // If headers have been sent, we can only end the response
    if (headersSent) {
      try {
        const errorChunk = JSON.stringify({
          error: 'Error during streaming',
          message: error.message,
          isFinal: true
        });
        res.write(errorChunk + '\n');
      } catch (err) {
        console.error('Error sending error chunk:', err);
      }
      res.end();
    } else {
      // Otherwise send a proper error response
      res.status(500).json({ 
        error: 'Failed to stream message',
        message: error.message 
      });
    }
  }
};
