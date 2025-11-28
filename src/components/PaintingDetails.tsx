import React, { useState } from 'react';
import './PaintingDetails.css';

interface PaintingDetailsProps {
  title: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  year: number;
  medium: string;
  size: string;
  onNext?: () => void;
  onPrevious?: () => void;
  totalCount?: number;
  currentIndex?: number;
}

const PaintingDetails: React.FC<PaintingDetailsProps> = ({
  title,
  description,
  image,
  images = [image],
  price,
  year,
  medium,
  size,
  onNext,
  onPrevious,
  totalCount,
  currentIndex,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleSelectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="painting-details">
      <div className="image-section">
        <div className="details-image-wrapper">
          <img
            src={images[currentImageIndex]}
            alt={`${title} - изображение ${currentImageIndex + 1}`}
            className="details-image"
          />
        </div>

        {images.length > 1 && (
          <div className="images-gallery">
            {images.map((img, index) => (
              <button
                key={index}
                className={`gallery-thumbnail ${
                  index === currentImageIndex ? 'active' : ''
                }`}
                onClick={() => handleSelectImage(index)}
                aria-label={`Изображение ${index + 1}`}
              >
                <img src={img} alt={`Превью ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="details-content">
        <h2 className="details-title">{title}</h2>
        <p className="details-description">{description}</p>

        <div className="details-info">
          <div className="info-item">
            <span className="info-label">Год:</span>
            <span className="info-value">{year}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Техника:</span>
            <span className="info-value">{medium}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Размер:</span>
            <span className="info-value">{size}</span>
          </div>
        </div>

        <div className="details-footer">
          <span className="details-price">{price.toLocaleString('ru-RU')} ₽</span>
          <button className="buy-button">Купить</button>
        </div>
      </div>

      <div className="details-nav-controls">
        {onPrevious && (
          <button
            className="details-nav-button prev-button"
            onClick={onPrevious}
            aria-label="Предыдущая картина"
          >
            ‹ Назад
          </button>
        )}
        <div className="details-counter">
          Картина {currentIndex} / {totalCount}
        </div>
        {onNext && (
          <button
            className="details-nav-button next-button"
            onClick={onNext}
            aria-label="Следующая картина"
          >
            Вперед ›
          </button>
        )}
      </div>
    </div>
  );
};

export default PaintingDetails;
