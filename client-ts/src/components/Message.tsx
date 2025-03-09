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
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 shadow-md shadow-purple-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="12" rx="2" />
            <circle cx="8.5" cy="16" r="1.5" />
            <circle cx="15.5" cy="16" r="1.5" />
            <path d="M12 7v3" />
            <line x1="8" y1="22" x2="8" y2="22.5" />
            <line x1="16" y1="22" x2="16" y2="22.5" />
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
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center ml-3 shadow-md shadow-blue-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Message; 