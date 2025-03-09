import React from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[center_top_-1px] [mask-image:linear-gradient(to_bottom,transparent,black,black,transparent)]"></div>
        <div className="relative z-10">
          <ChatInterface />
        </div>
      </main>
      <footer className="py-6 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        </div>
      </footer>
    </div>
  );
};

export default App; 