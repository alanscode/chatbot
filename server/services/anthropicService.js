const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required in environment variables');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model and parameters
const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
const DEFAULT_MAX_TOKENS = 4000;
const DEFAULT_TEMPERATURE = 0.3;

exports.sendMessage = async (messages, options = {}) => {
  try {
    // Filter out messages with empty content
    const validMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
    
    if (validMessages.length === 0) {
      throw new Error('No valid messages with content provided');
    }
    
    const formattedMessages = validMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    // Extract system messages
    const systemMessages = validMessages
      .filter(msg => msg.role === 'system')
      .map(msg => msg.content)
      .join('\n\n');

    console.log('Sending to Anthropic API:', {
      model: options.model || DEFAULT_MODEL,
      messages: formattedMessages,
      system: systemMessages || undefined,
    });

    const response = await anthropic.messages.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
      messages: formattedMessages,
      system: systemMessages || undefined,
      temperature: options.temperature || DEFAULT_TEMPERATURE,
    });

    console.log('Received response from Anthropic API');

    return {
      role: 'assistant',
      content: response.content[0].text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

exports.streamMessage = async (messages, options = {}, onChunk) => {
  try {
    console.log('Streaming from Anthropic API:', {messages, options});
    // Filter out messages with empty content
    const validMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
    
    if (validMessages.length === 0) {
      throw new Error('No valid messages with content provided');
    }
    
    const formattedMessages = validMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    // Extract system messages
    const systemMessages = validMessages
      .filter(msg => msg.role === 'system')
      .map(msg => msg.content)
      .join('\n\n');

    console.log('Streaming from Anthropic API:', {
      model: options.model || DEFAULT_MODEL,
      messages: formattedMessages,
      system: systemMessages || undefined,
    });

    const stream = await anthropic.messages.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
      messages: formattedMessages,
      system: systemMessages || undefined,
      temperature: options.temperature || DEFAULT_TEMPERATURE,
      stream: true,
    });

    let accumulatedContent = '';
    let chunkCount = 0;
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta && chunk.delta.text) {
        const chunkText = chunk.delta.text;
        accumulatedContent += chunkText;
        chunkCount++;
        
        console.log(`Received chunk #${chunkCount}: "${chunkText.substring(0, 20)}${chunkText.length > 20 ? '...' : ''}"`);
        
        // Send the accumulated content with each chunk, not just the individual chunk
        onChunk({
          role: 'assistant',
          content: accumulatedContent,
          timestamp: new Date().toISOString(),
          isPartial: true,
          chunkId: chunkCount
        });
      }
    }

    console.log(`Stream completed. Total chunks: ${chunkCount}, Total content length: ${accumulatedContent.length}`);

    // Send final complete message
    console.log(`Sending final message with content length: ${accumulatedContent.length}`);
    onChunk({
      role: 'assistant',
      content: accumulatedContent,
      timestamp: new Date().toISOString(),
      isPartial: false,
      isFinal: true
    });
    
    return accumulatedContent;
  } catch (error) {
    console.error('Error in streamMessage:', error);
    throw error;
  }
};
