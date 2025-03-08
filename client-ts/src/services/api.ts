import axios from 'axios';
import { Message } from '../context/ChatContext';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  [key: string]: any;
}

export const sendMessage = async (messages: Message[], options: ChatOptions = {}): Promise<Message> => {
  try {
    const response = await api.post('/chat', { 
      messages,
      options
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

export const streamMessage = async (
  messages: Message[], 
  options: ChatOptions = {}, 
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    // Keep track of processed chunks to avoid duplicates
    let lastChunkContent = '';
    let hasReceivedAnyContent = false;
    let progressEventCount = 0;
    
    console.log('Starting stream request to /chat/stream');
    
    // Debug the request
    debugStreamRequest(messages, options);
    
    // Use fetch API directly for streaming instead of axios
    // This provides better support for streaming responses
    const fetchResponse = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, options }),
      credentials: 'include'
    });
    
    if (!fetchResponse.ok) {
      throw new Error(`Stream request failed with status ${fetchResponse.status}`);
    }
    
    // Get the reader from the response body stream
    const reader = fetchResponse.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader from response');
    }
    
    let accumulatedContent = '';
    let decoder = new TextDecoder();
    
    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream complete');
        break;
      }
      
      // Decode the chunk and process it
      const chunk = decoder.decode(value, { stream: true });
      
      if (chunk) {
        hasReceivedAnyContent = true;
        
        try {
          // Parse the chunk as JSON to extract only the message content
          const parsedChunk = JSON.parse(chunk);
          const contentOnly = parsedChunk.content || '';
          
          // Only update if the content is different from the last chunk
          // This prevents duplicate text from being displayed
          if (contentOnly !== lastChunkContent) {
            // Instead of accumulating chunks, replace with the complete content
            // This ensures only the final message is displayed
            accumulatedContent = contentOnly;
            lastChunkContent = contentOnly;
            
            // Call the onChunk callback if provided
            if (onChunk) {
              onChunk(contentOnly);
            }
          }
        } catch (parseError) {
          // If parsing fails, use the raw chunk as before
          console.warn('Failed to parse chunk as JSON, using raw chunk:', parseError);
          
          // Only update if the content is different from the last chunk
          if (chunk !== lastChunkContent) {
            accumulatedContent = chunk;
            lastChunkContent = chunk;
            
            // Call the onChunk callback if provided
            if (onChunk) {
              onChunk(chunk);
            }
          }
        }
      }
      
      progressEventCount++;
      if (progressEventCount % 10 === 0) {
        console.log(`Received ${progressEventCount} chunks so far`);
      }
    }
    
    if (!hasReceivedAnyContent) {
      console.warn('No content received from stream');
    }
    
    return accumulatedContent;
  } catch (error: any) {
    console.error('Error in stream request:', error);
    throw new Error(error.message || 'Failed to stream message');
  }
};

// Helper function to debug stream requests
const debugStreamRequest = (messages: Message[], options: ChatOptions): void => {
  console.log(`Sending ${messages.length} messages to stream endpoint`);
  console.log('Options:', options);
  
  // Log the last few messages for context
  const lastMessages = messages.slice(-3);
  console.log('Last few messages:', lastMessages.map(m => ({
    role: m.role,
    contentLength: m.content ? m.content.length : 0,
    contentPreview: m.content ? `${m.content.substring(0, 50)}...` : 'empty'
  })));
}; 