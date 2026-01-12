import React, { useCallback, useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Сохраняем ширину скроллбара
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content${className ? ` ${className}` : ''}`} onClick={handleContentClick}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default React.memo(Modal);
