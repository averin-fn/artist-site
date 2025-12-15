import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ImageWithLoader from '../components/ImageWithLoader';
import aboutData from '../config/about.json';
import './About.css';

const About: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const images = aboutData.gallery;

  const handlePrevImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % images.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  useEffect(() => {
    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImageIndex]);

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
              onClick={() => setSelectedImageIndex(index)}
            >
              <ImageWithLoader src={image} alt={`${aboutData.name} ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {selectedImageIndex !== null && (
        <Modal isOpen={true} onClose={() => setSelectedImageIndex(null)}>
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
