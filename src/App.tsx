import React from 'react';
import Hero from './components/Hero';
import Converter from './components/Converter';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4">
        <Hero />
        <Converter />
      </div>
    </div>
  );
}

export default App;