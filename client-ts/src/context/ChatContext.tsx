import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define types for our messages
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  id?: string;
  streaming?: boolean;
}

// Define the context type
interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context with a default value
export const ChatContext = createContext<ChatContextType>({
  messages: [],
  addMessage: () => {},
  updateMessage: () => {},
  clearMessages: () => {},
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
});

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load messages from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (e) {
      console.error('Error loading saved messages:', e);
      localStorage.removeItem('chatMessages');
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving messages:', e);
    }
  }, [messages]);
  
  const addMessage = (message: Message) => {
    setMessages(prevMessages => {
      // Check if this is an update to an existing message (for streaming)
      if (message.id) {
        const index = prevMessages.findIndex(m => m.id === message.id);
        if (index !== -1) {
          console.log('Updating existing message by ID:', message.id, 'Content length:', message.content ? message.content.length : 0);
          const newMessages = [...prevMessages];
          
          // Preserve content if the new message has empty content
          if ((!message.content || message.content.trim() === '') && newMessages[index].content) {
            console.log('New message has empty content, keeping existing content:', newMessages[index].content.length);
            message.content = newMessages[index].content;
          }
          
          // Only update if the content is different or streaming state changed
          if (newMessages[index].content !== message.content || 
              newMessages[index].streaming !== message.streaming) {
            // Replace the entire message instead of appending content
            newMessages[index] = message;
            return newMessages;
          }
          return prevMessages;
        }
      }
      
      // Otherwise add as a new message
      return [...prevMessages, message];
    });
  };
  
  const updateMessage = (id: string, content: string) => {
    setMessages(prevMessages => {
      const index = prevMessages.findIndex(m => m.id === id);
      if (index === -1) return prevMessages;
      
      const newMessages = [...prevMessages];
      newMessages[index] = {
        ...newMessages[index],
        content,
      };
      return newMessages;
    });
  };
  
  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };
  
  // Update this code to handle non-string content
  const updatedMessages = messages.map(e => ({
    ...e,
    content: typeof e.content === 'string' ? e.content.trim() : e.content
  }));
  
  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      updateMessage,
      clearMessages,
      loading,
      setLoading,
      error,
      setError
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 