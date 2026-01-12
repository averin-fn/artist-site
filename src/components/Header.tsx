import React, { useCallback, useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  currentTab: 'gallery' | 'about';
  onTabChange: (tab: 'gallery' | 'about') => void;
}

const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGalleryClick = useCallback(() => onTabChange('gallery'), [onTabChange]);
  const handleAboutClick = useCallback(() => onTabChange('about'), [onTabChange]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <h1 className="header-title">Галерея Художника</h1>
        <nav className="nav">
          <button
            className={`nav-tab ${currentTab === 'gallery' ? 'active' : ''}`}
            onClick={handleGalleryClick}
          >
            Галерея
          </button>
          <button
            className={`nav-tab ${currentTab === 'about' ? 'active' : ''}`}
            onClick={handleAboutClick}
          >
            О художнике
          </button>
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header);
