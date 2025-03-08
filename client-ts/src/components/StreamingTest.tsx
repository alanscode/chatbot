import React, { useState } from 'react';
import { streamMessage } from '../services/api';
import { Message } from '../context/ChatContext';

const StreamingTest: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    setResponse('');
    
    try {
      // Create a simple message array with just the user's input
      const messages: Message[] = [
        {
          role: 'user',
          content: input.trim(),
          timestamp: new Date().toISOString()
        }
      ];
      
      // Accumulated content for the streaming response
      let accumulatedContent = '';
      
      // Stream the message and update the response in real-time
      await streamMessage(
        messages,
        {},
        (chunk: string) => {
          accumulatedContent += chunk;
          setResponse(accumulatedContent);
        }
      );
      
    } catch (error: any) {
      console.error('Error in streaming test:', error);
      setError(error.message || 'An error occurred while streaming');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Streaming Test</h2>
        <p className="text-sm text-gray-500">Test the streaming API directly</p>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              id="prompt"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your prompt here..."
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? 'Streaming...' : 'Stream Response'}
          </button>
        </form>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="text-sm">Error: {error}</p>
          </div>
        )}
        
        {(response || loading) && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Response:</h3>
            <div className={`p-4 bg-gray-50 rounded-md ${loading ? 'animate-pulse' : ''}`}>
              {response ? (
                <div className="prose prose-sm max-w-none">
                  {response}
                </div>
              ) : (
                <div className="text-gray-400">Waiting for response...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingTest; 