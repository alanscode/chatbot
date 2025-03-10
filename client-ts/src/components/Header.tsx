import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="12" rx="2" />
              <circle cx="8.5" cy="16" r="1.5" />
              <circle cx="15.5" cy="16" r="1.5" />
              <path d="M12 7v3" />
              <line x1="8" y1="22" x2="8" y2="22.5" />
              <line x1="16" y1="22" x2="16" y2="22.5" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">
           Alan Nguyen - Virtual Persona
          </h1>
          <span className="ml-3 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
            AI First Developer
          </span>
        </div>
        <div className="text-sm text-slate-400">
        </div>
      </div>
    </header>
  );
};

export default Header; 