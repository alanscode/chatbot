import React from 'react';
import HomePage from './components/HomePage';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4">
        <HomePage />
      </main>
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          Powered by Anthropic's Claude 3.7
        </div>
      </footer>
    </div>
  );
};

export default App; 