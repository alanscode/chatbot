import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import { useChat } from '../hooks/useChat';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const { messages, streamMessageToAssistant, clearMessages, loading, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userInput = input.trim();
    setInput('');
    
    // Use streaming for better UX
    await streamMessageToAssistant(userInput);
  };
  
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      clearMessages();
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-medium text-white">Virtual Assistant</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-red-500/20 rounded-md transition-all duration-200 flex items-center gap-1.5 border border-slate-700 hover:border-red-500/50"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Chat
          </button>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-center text-xl font-medium text-white mb-2">Start a conversation with Claude 3.7</p>
            <p className="text-sm text-center text-slate-400 max-w-md">Ask me anything - from creative writing and coding to complex problem-solving and research assistance.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 text-red-200">
          <p className="text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {/* Input Area */}
      <div className="border-t border-slate-700 p-4 bg-slate-800/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-slate-700/50 text-white placeholder-slate-400 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </form>
        <div className="mt-2 text-xs text-slate-500 text-center">
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 