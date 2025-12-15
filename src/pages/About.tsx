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
