import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from '../components/Modal';
import ImageWithLoader from '../components/ImageWithLoader';
import aboutData from '../config/about.json';
import './About.css';

const About: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const images = useMemo(() => aboutData.gallery, []);

  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % images.length;
    });
  }, [images.length]);

  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') handleCloseModal();
    };

    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImageIndex, handlePrevImage, handleNextImage, handleCloseModal]);

  return (
    <div className="about">
      <div className="about-header">
        <h1>{aboutData.name}</h1>
        <p className="about-description">{aboutData.bio}</p>
      </div>

      <div className="about-gallery">
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => handleImageClick(index)}
            >
              <ImageWithLoader src={image} alt={`${aboutData.name} ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {aboutData.contacts && (
        <div className="about-contacts">
          <h2>Контакты</h2>
          <div className="contacts-grid">
            {aboutData.contacts.phone && (
              <a href={`tel:${aboutData.contacts.phone.replace(/[^+\d]/g, '')}`} className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{aboutData.contacts.phone}</span>
              </a>
            )}
            {aboutData.contacts.email && (
              <a href={`mailto:${aboutData.contacts.email}`} className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{aboutData.contacts.email}</span>
              </a>
            )}
            {aboutData.contacts.vk && (
              <a href={aboutData.contacts.vk} target="_blank" rel="noopener noreferrer" className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.814-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
                <span>ВКонтакте</span>
              </a>
            )}
            {aboutData.contacts.instagram && (
              <a href={aboutData.contacts.instagram} target="_blank" rel="noopener noreferrer" className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>
      )}

      {selectedImageIndex !== null && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <div className="modal-gallery-wrapper">
            <div className="modal-image-container">
              <ImageWithLoader src={images[selectedImageIndex]} alt={`${aboutData.name} ${selectedImageIndex + 1}`} />
            </div>

            <div className="modal-gallery-controls">
              <button
                className="modal-nav-button modal-prev-button"
                onClick={handlePrevImage}
                aria-label="Предыдущее изображение"
              >
                ‹ Назад
              </button>

              <div className="modal-gallery-counter">
                Изображение {selectedImageIndex + 1} / {images.length}
              </div>

              <button
                className="modal-nav-button modal-next-button"
                onClick={handleNextImage}
                aria-label="Следующее изображение"
              >
                Вперед ›
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default About;
