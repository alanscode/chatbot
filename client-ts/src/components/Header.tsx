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
           Alan Nguyen
          </h1>
          <span className="ml-3 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
            Senior Full Stack Developer
          </span>
        </div>
        <div className="text-sm text-slate-400">
          <button 
            className="relative px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md font-medium flex items-center group overflow-hidden"
            onClick={() => window.open('/resume.pdf', '_blank')}
          >
            {/* Animated background shine effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></span>
            
            {/* Pulsing glow effect */}
            <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 animate-[ping_2s_ease-in-out_infinite] bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-md"></span>
            
            <svg xmlns="http://www.w3.org/2000/svg" className="relative h-5 w-5 mr-2 group-hover:animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="relative font-bold tracking-wide">Download Resume</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 