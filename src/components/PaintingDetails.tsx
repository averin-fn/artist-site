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
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setScale(1);
    setPanX(0);
    setPanY(0);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale - 0.5 <= 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panX,
        y: e.clientY - panY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDragging || scale <= 1) return;

    const moveX = e.clientX - dragStart.x;
    const moveY = e.clientY - dragStart.y;

    const maxPan = (scale - 1) * 150;
    setPanX(Math.max(-maxPan, Math.min(maxPan, moveX)));
    setPanY(Math.max(-maxPan, Math.min(maxPan, moveY)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
          <button
            className="zoom-button"
            onClick={toggleZoom}
            aria-label="Увеличить изображение"
            title="Увеличить"
          >
            Увеличить
          </button>
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

      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <div className="zoom-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="zoom-close"
              onClick={() => setIsZoomed(false)}
              aria-label="Закрыть"
            >
              ✕
            </button>
            <div className="zoom-controls">
              <button
                className="zoom-control-button"
                onClick={handleZoomOut}
                disabled={scale <= 1}
                aria-label="Уменьшить"
                title="Уменьшить (−)"
              >
                −
              </button>
              <span className="zoom-level">{Math.round(scale * 100)}%</span>
              <button
                className="zoom-control-button"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                aria-label="Увеличить"
                title="Увеличить (+)"
              >
                +
              </button>
            </div>
            <img
              src={images[currentImageIndex]}
              alt={`${title} - увеличено`}
              className="zoom-image"
              style={{
                transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'auto',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      )}

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
