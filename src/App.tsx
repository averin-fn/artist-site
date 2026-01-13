import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Gallery from './pages/Gallery';
import About from './pages/About';
import './App.css';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'gallery' | 'about'>('gallery');

  const handleTabChange = useCallback((tab: 'gallery' | 'about') => {
    setCurrentTab(tab);
  }, []);

  return (
    <div className="app">
      <Header currentTab={currentTab} onTabChange={handleTabChange} />
      <main className="app-content">
        {currentTab === 'gallery' && <Gallery />}
        {currentTab === 'about' && <About />}
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 Галерея Художника. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default App;
