const anthropicService = require('../services/anthropicService');
const loggingService = require('../services/loggingService');
const { loadResumeData, cleanMessages } = require('../utils/chat-utils');

// Helper function to prepare messages with system prompts
const prepareMessages = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }
  
  // Use loadResumeData utility instead of duplicating the logic
  const { systemPrompt, resumeContent } = loadResumeData();
  
  // Add both system prompt and resume content
  messages.unshift(
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'system',
      content: '-- RESUME START --\n' + resumeContent
    }
  );
  
  return messages;
};

// Export prepareMessages for testing
exports.prepareMessages = prepareMessages;

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
  
  // Use cleanMessages utility instead of custom validation
  const { valid, error, cleanedMessages } = cleanMessages(messages);
  
  if (!valid) {
    res.status(400).json({ error });
    return { isValid: false };
  }
  
  try {
    const preparedMessages = prepareMessages(cleanedMessages);
    const userQuestion = extractUserQuestion(messages);
    return { messages: preparedMessages, options, userQuestion, isValid: true };
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
