import { useContext, useCallback, useState, useEffect } from 'react';
import { ChatContext, Message } from '../context/ChatContext';
import { sendMessage, streamMessage } from '../services/api';

interface UseChatReturn {
  messages: Message[];
  sendMessageToAssistant: (content: string, options?: any) => Promise<void>;
  streamMessageToAssistant: (content: string, options?: any) => Promise<void>;
  clearMessages: () => void;
  loading: boolean;
  error: string | null;
}

export const useChat = (): UseChatReturn => {
  const { 
    messages, 
    addMessage, 
    clearMessages, 
    loading, 
    setLoading, 
    error,
    setError
  } = useContext(ChatContext);
  const [typingTimer] = useState<NodeJS.Timeout | null>(null);

  // Clean up typing timer when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [typingTimer]);

  const sendMessageToAssistant = useCallback(async (content: string, options = {}) => {
    try {
      if (!content || content.trim() === '') {
        throw new Error('Message content cannot be empty');
      }

      setLoading(true);
      setError(null);

      // Add user message to the chat
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      // Format messages for the API - ensure all messages have valid content
      const formattedMessages = messages
        .filter(msg => {
          // Keep messages with valid content
          return msg.content !== undefined && msg.content !== null;
        })
        .map(msg => {
          // Ensure content is a string
          let safeContent = '';
          if (typeof msg.content === 'string') {
            safeContent = msg.content;
          } else if (msg.content !== undefined && msg.content !== null) {
            try {
              safeContent = JSON.stringify(msg.content);
            } catch (e) {
              console.warn('Failed to stringify content:', e);
              safeContent = String(msg.content);
            }
          }
          
          return {
            role: msg.role,
            content: safeContent,
            timestamp: msg.timestamp
          };
        });

      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      });

      // Log the messages being sent
      console.log('Sending messages to API:', formattedMessages);

      // Send the message to the API
      const response = await sendMessage(formattedMessages, options);

      // Add the assistant's response to the chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);
    } catch (error: any) {
      console.error('Error in sendMessageToAssistant:', error);
      setError(error.message || 'An error occurred while sending your message');
    } finally {
      setLoading(false);
    }
  }, [messages, addMessage, setLoading, setError]);

  const streamMessageToAssistant = useCallback(async (content: string, options = {}) => {
    try {
      if (!content || content.trim() === '') {
        throw new Error('Message content cannot be empty');
      }

      setLoading(true);
      setError(null);

      // Add user message to the chat
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      // Create a placeholder for the assistant's response
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        id: assistantMessageId,
        streaming: true,
      };
      addMessage(assistantMessage);

      // Format messages for the API - ensure all messages have valid content
      const formattedMessages = messages
        .filter(msg => {
          // Keep messages with valid content
          return msg.content !== undefined && msg.content !== null;
        })
        .map(msg => {
          // Ensure content is a string
          let safeContent = '';
          if (typeof msg.content === 'string') {
            safeContent = msg.content;
          } else if (msg.content !== undefined && msg.content !== null) {
            try {
              safeContent = JSON.stringify(msg.content);
            } catch (e) {
              console.warn('Failed to stringify content:', e);
              safeContent = String(msg.content);
            }
          }
          
          return {
            role: msg.role,
            content: safeContent,
            timestamp: msg.timestamp
          };
        });

      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      });

      // Log the messages being sent
      console.log('Sending messages to API:', formattedMessages);

      // Track the latest content to avoid duplicate updates
      let lastContent = '';

      // Stream the message
      const finalContent = await streamMessage(
        formattedMessages,
        options,
        (chunk: string) => {
          // Only update if the content is different from the last update
          // This prevents duplicate text from being displayed
          if (chunk !== lastContent) {
            lastContent = chunk;
            
            // Replace the assistant message with the new content
            // instead of accumulating chunks
            addMessage({
              ...assistantMessage,
              content: chunk,
            });
          }
        }
      );

      // Make sure we have content in the final update
      if (!lastContent && finalContent) {
        lastContent = finalContent;
        addMessage({
          ...assistantMessage,
          content: finalContent,
        });
      }

      // Final update to mark streaming as complete
      addMessage({
        ...assistantMessage,
        content: lastContent || '',
        streaming: false,
      });

    } catch (error: any) {
      console.error('Error in streamMessageToAssistant:', error);
      setError(error.message || 'An error occurred while streaming your message');
    } finally {
      setLoading(false);
    }
  }, [messages, addMessage, setLoading, setError]);

  return {
    messages,
    sendMessageToAssistant,
    streamMessageToAssistant,
    clearMessages,
    loading,
    error
  };
}; 