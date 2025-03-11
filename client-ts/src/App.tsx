import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import ResumeEditor from './components/ResumeEditor';
import Header from './components/Header';
import './styles/markdown-editor.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 relative">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[center_top_-1px] [mask-image:linear-gradient(to_bottom,transparent,black,black,transparent)]"></div>
          <div className="relative z-10">
            <div className="mb-6 flex justify-end space-x-4">
              <Link
                to="/"
                className="px-4 py-2 text-slate-300 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:bg-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Chat
              </Link>
              <Link
                to="/resume"
                className="px-4 py-2 text-slate-300 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:bg-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Resume Editor
              </Link>
            </div>
            <Routes>
              <Route path="/" element={<ChatInterface />} />
              <Route path="/resume" element={<ResumeEditor />} />
            </Routes>
          </div>
        </main>
        <footer className="py-6 border-t border-slate-800">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App; 