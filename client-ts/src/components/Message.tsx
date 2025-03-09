import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message as MessageType } from '../context/ChatContext';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 shadow-md shadow-purple-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div 
        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20' 
            : 'bg-slate-700/70 text-slate-100 shadow-lg shadow-slate-900/10 border border-slate-600/50'
        } ${message.streaming ? 'border-l-4 border-purple-500 animate-pulse' : ''} transition-all duration-200`}
      >
        {message.content ? (
          <ReactMarkdown
            className={`prose prose-sm max-w-none ${isUser ? 'prose-invert text-white' : 'prose-slate text-slate-100'}`}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus as any}
                    PreTag="div"
                    className="rounded-md my-3 text-sm"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`${className} bg-slate-800 text-slate-200 px-1 py-0.5 rounded`} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 last:mb-0">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
            <span className="text-slate-400 ml-1">Generating response...</span>
          </div>
        )}
      </div>
      
      {/* Avatar for user */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-3 shadow-md shadow-blue-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Message; 