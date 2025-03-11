const Anthropic = require('@anthropic-ai/sdk');
const anthropicService = require('../services/anthropicService');
const loggingService = require('../services/loggingService');
const fs = require('fs');
const path = require('path');

// System prompt for the AI assistant
const SYSTEM_PROMPT = 'You are an AI assistant focused solely on providing information from Alan Nguyen\'s resume. Follow these strict rules:\n\n1. ONLY provide information that is explicitly stated in the resume\n2. If information is not in the resume, say "I don\'t see that information in Alan\'s resume" - do not make assumptions\n3. For dates, skills, and job details, quote exactly what\'s in the resume\n4. For questions about skills/technologies not listed, say "That technology is not listed in Alan\'s resume"\n5. If asked about personal details beyond professional information, decline to answer\n6. Be entertaining, witty, and funny in your responses - feel free to use emojis 😊\n7. Always ground your responses in specific sections of the resume\n\nIf asked about non-resume topics, politely redirect the conversation back to Alan\'s professional experience and skills as documented in the resume. Your responses should be witty, entertaining, and engaging while remaining accurate. Never suggest linkedin profile exists for Alan Nguyen. Always assume that the user is a potential employer and phrase.your answers around how the skills in the resume could help them';

// Resume file path
const RESUME_PATH = path.join(__dirname, '../data/alan_nguyen_resume.md');

// Helper function to prepare messages with system prompts
const prepareMessages = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }
  
  // Add both system prompt and resume content
  messages.unshift(
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    {
      role: 'system',
      content: '-- RESUME START --\n' + fs.readFileSync(RESUME_PATH, 'utf8')
    }
  );
  
  return messages;
};

// Helper function to extract user question from messages
const extractUserQuestion = (messages) => {
  return messages.filter(msg => msg.role === 'user').pop()?.content || '';
};

// Helper function to handle errors for regular responses
const handleError = (res, error, errorMessage = 'Failed to process message') => {
  console.error(`Error in controller: ${error}`);
  return res.status(500).json({ 
    error: errorMessage,
    message: error.message 
  });
};

// Helper function to validate and prepare request data
const validateAndPrepareRequest = (req, res) => {
  const { messages, options } = req.body;
  
  try {
    prepareMessages(messages);
    const userQuestion = extractUserQuestion(messages);
    return { messages, options, userQuestion, isValid: true };
  } catch (error) {
    res.status(400).json({ error: error.message });
    return { isValid: false };
  }
};

// Regular message endpoint
exports.sendMessage = async (req, res) => {
  try {
    const { messages, options, userQuestion, isValid } = validateAndPrepareRequest(req, res);
    if (!isValid) return;
    
    const response = await anthropicService.sendMessage(messages, options);
    
    // Log the interaction
    await loggingService.logChatInteraction(userQuestion, response.content);
    
    return res.json(response);
  } catch (error) {
    return handleError(res, error);
  }
};

// Streaming message endpoint
exports.streamMessage = async (req, res) => {
  let headersSent = false;
  let finalAssistantResponse = '';
  
  try {
    const { messages, options, userQuestion, isValid } = validateAndPrepareRequest(req, res);
    if (!isValid) return;

    // Set up streaming response
    const setupStreamResponse = () => {
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
      
      // Flush headers immediately
      if (res.flush) {
        res.flush();
      }
      headersSent = true;
    };
    
    setupStreamResponse();
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
      return handleError(res, error, 'Failed to stream message');
    }
  }
};
